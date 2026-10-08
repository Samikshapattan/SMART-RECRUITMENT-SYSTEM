// routes/resume.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const ParseJob = require('../models/ParseJob'); // single declaration - DO NOT duplicate

// configure multer storage
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2,9)}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /api/resume/upload  (authenticated)
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.user.id;
    const resumePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');

    // Create parse job
    const job = new ParseJob({
      userId,
      resumePath,
      status: 'pending',
      attempts: 0
    });
    await job.save();

    // Optionally attach resumePath to user candidateProfile.resumePath
    await User.findByIdAndUpdate(userId, { $set: { 'candidateProfile.resumePath': resumePath } }).catch(()=>{});

    return res.json({
      message: 'Uploaded',
      resumePath,
      jobId: job._id,
      job
    });
  } catch (err) {
    console.error('POST /api/resume/upload error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/resume/myjobs  (authenticated)
router.get('/myjobs', authMiddleware, async (req, res) => {
  try {
    const jobs = await ParseJob.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (err) {
    console.error('GET /api/resume/myjobs error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/resume/job/:id  (authenticated)
router.get('/job/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const job = await ParseJob.findById(id).lean();
    if (!job) return res.status(404).json({ error: 'Job not found' });
    // enforce user only sees own jobs (unless recruiter/admin design)
    if (String(job.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(job);
  } catch (err) {
    console.error('GET /api/resume/job/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
