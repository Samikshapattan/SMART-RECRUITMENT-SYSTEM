const express = require("express");
const router = express.Router();
const User = require("../models/User");
const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL;

// Extract recruiter query → keywords + embedding
router.post("/search", async (req, res) => {
  try {
    const { prompt } = req.body;

    // 1) Get embedding for query
    const embedRes = await axios.post(`${ML_URL}/embed`, {
      text: prompt,
      skills: []
    });

    const queryVector = embedRes.data.embedding;

    // 2) Fetch all candidates
    const candidates = await User.find({ role: "candidate" }).lean();

    const results = [];

    for (let c of candidates) {
      if (!c.candidateProfile) continue;
      if (!c.candidateProfile.embedding) continue;

      const candEmb = c.candidateProfile.embedding;

      // Cosine similarity
      const dot = candEmb.reduce((sum, v, i) => sum + v * queryVector[i], 0);
      const magA = Math.sqrt(candEmb.reduce((s, v) => s + v * v, 0));
      const magB = Math.sqrt(queryVector.reduce((s, v) => s + v * v, 0));
      const similarity = dot / (magA * magB);

      results.push({
        name: c.candidateProfile.fullName,
        email: c.email,
        similarity: similarity,
        skills: c.candidateProfile.skills,
      });
    }

    results.sort((a, b) => b.similarity - a.similarity);

    res.json({ results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  // convert recruiter prompt → query vector
  const embedRes = await axios.post(`${ML_URL}/embed`, {
    text: message,
    skills: []
  });

  const results = await searchCandidates(embedRes.data.embedding);

  let text = `Found ${results.length} candidates:\n\n`;

  results.forEach(r => {
    text += `- ${r.name} (${Math.round(r.similarity * 100)}% match)\n`;
  });

  res.json({ reply: text });
});



module.exports = router;
