/**
 * worker.js
 * SmartHire – Resume Parser + ML Enricher + ATS Scorer
 */

require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const ParseJob = require("./models/ParseJob");

// ----------------------------------------------------------------------
// ENV
// ----------------------------------------------------------------------

const MONGODB_URI = process.env.MONGODB_URI;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "3000", 10);

const PARSER_URL = process.env.PARSER_SERVICE_URL; // e.g. http://parser:7000/parse_resume
const ML_URL = process.env.ML_SERVICE_URL;         // e.g. http://ml-service:8000

// ----------------------------------------------------------------------
// DB CONNECT
// ----------------------------------------------------------------------

async function connectDb() {
  await mongoose.connect(MONGODB_URI);
  console.log("Worker connected to MongoDB");
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const safeString = (v) =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

const normalizeArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "object") return [v];
  return [String(v)];
};

// SAFE SKILL PARSER
function parseSkills(section) {
  if (!section) return [];

  // If ML returned array
  if (Array.isArray(section)) {
    return section
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter(Boolean);
  }

  // If parser returned non-string object → skip
  if (typeof section !== "string") return [];

  return section
    .split(/[,|\n•;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// 🧹 Clean up education a bit (drop things that look like experience)
function cleanEducation(list) {
  const arr = normalizeArray(list);
  return arr.filter((item) => {
    const line =
      typeof item === "string"
        ? item.toLowerCase()
        : JSON.stringify(item).toLowerCase();

    const hasDegreeOrSchool = /bachelor|master|b\.tech|btech|mtech|b\.e|m\.e|bsc|msc|class 10|class 12|10th|12th|puc|diploma|school|college|university|cgpa|percentage/.test(
      line
    );

    const looksExperience =
      /(intern|professional experience|springboard|solutions|lead|developer|engineer)/.test(
        line
      );

    return hasDegreeOrSchool && !looksExperience;
  });
}

// 🧹 Clean up experience (drop clear education lines only)
function cleanExperience(list) {
  const arr = normalizeArray(list);
  return arr.filter((item) => {
    const line =
      typeof item === "string"
        ? item.toLowerCase()
        : JSON.stringify(item).toLowerCase();

    const obviouslyEducation =
      /bachelor|master|b\.tech|btech|mtech|b\.e|m\.e|bsc|msc|class 10|class 12|10th|12th|school|college|university|cgpa|percentage/.test(
        line
      );

    // keep everything that is not 100% education
    return !obviouslyEducation;
  });
}

// ----------------------------------------------------------------------
// PROCESS A SINGLE JOB
// ----------------------------------------------------------------------

async function processJob() {
  let job = await ParseJob.findOneAndUpdate(
    { status: "pending", attempts: { $lt: 3 } },
    { status: "processing", $inc: { attempts: 1 } },
    { new: true }
  );

  if (!job) return;

  console.log(`🔵 Processing job ${job._id} (attempt ${job.attempts})`);

  try {
    // 1️⃣ CALL PARSER SERVICE
    const FormData = require("form-data");
    const form = new FormData();

    const resumePath = path.join(process.cwd(), job.resumePath);
    form.append("resume", fs.createReadStream(resumePath));

    const parserResp = await axios.post(PARSER_URL, form, {
      headers: form.getHeaders(),
      timeout: 120000,
    });

    const parserData = parserResp.data || {};

    const rawText =
      parserData.rawText || parserData.raw || parserData.text || "";

    // 2️⃣ CALL ML SERVICE
    const mlResp = await axios.post(
      `${ML_URL}/ml/predict`,
      { text: rawText, structured: parserData },
      { timeout: 120000 }
    );

    const ml = mlResp.data || {};

    // 3️⃣ MERGE PARSER + ML OUTPUT
    const fullName =
      safeString(parserData.fullName) ||
      safeString(ml.fullName) ||
      safeString(ml.identity?.name);

    const location =
      safeString(parserData.location) ||
      safeString(ml.identity?.location) ||
      "";

    const summary =
      safeString(parserData.summary) || safeString(ml.summary) || "";

    // ✅ Use parser’s structured sections and clean them
    const education = cleanEducation(parserData.education || []);
    const experience = cleanExperience(parserData.experience || []);

    // Skills: prefer ML if non-empty, else parser, else parse text
    let skills = [];

    if (Array.isArray(ml.skills) && ml.skills.length > 0) {
      skills = ml.skills
        .filter((s) => typeof s === "string")
        .map((s) => s.toLowerCase());
    } else if (Array.isArray(parserData.skills)) {
      skills = parserData.skills
        .map((s) => (typeof s === "string" ? s.toLowerCase() : ""))
        .filter(Boolean);
    } else {
      skills = parseSkills(parserData.skills);
    }

    // 4️⃣ UPDATE USER PROFILE
    const user = await User.findById(job.userId);
    if (!user) throw new Error("User not found");

    user.candidateProfile = {
      ...user.candidateProfile,
      fullName: fullName || user.fullName,
      email: parserData.email || user.email,
      phone: parserData.phone || ml.phone || user.phone,
      location,
      summary,
      education,
      experience,
      skills,
      parserVersion: ml.version || "ml-v1",
      resumePath: job.resumePath,
      parsedAt: new Date(),
      rawText,
      embeddings: ml.embeddings || [],
      atsScore: ml.atsScore || 0,
    };

    await user.save();

    // 5️⃣ SAVE RAW TEXT TO FILE (optional)
    const txtPath = `${resumePath}.txt`;
    fs.writeFileSync(txtPath, rawText, "utf8");
    user.candidateProfile.rawTextPath = txtPath;
    await user.save();

    // 6️⃣ MARK JOB COMPLETE
    job.status = "done";
    await job.save();

    console.log(`✅ Job ${job._id} completed successfully`);
  } catch (err) {
    console.error(`❌ Job ${job?._id} failed:`, err.message);

    job.status = "failed";
    job.error = err.message;
    await job.save();
  }
}

// ----------------------------------------------------------------------
// MAIN LOOP
// ----------------------------------------------------------------------

async function mainLoop() {
  while (true) {
    await processJob();
    await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
  }
}

(async () => {
  await connectDb();
  mainLoop();
})();
