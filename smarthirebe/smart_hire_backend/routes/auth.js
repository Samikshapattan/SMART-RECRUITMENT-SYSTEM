// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// ---------------------------
// GET /api/auth/me
// ---------------------------
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      candidateProfile: user.candidateProfile || {}
    });
  } catch (err) {
    console.error("GET /me error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// PATCH /api/auth/me
// ---------------------------
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;

    if (req.body.candidateProfile) {
      updates.candidateProfile = req.body.candidateProfile;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).lean();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      candidateProfile: user.candidateProfile || {}
    });
  } catch (err) {
    console.error("PATCH /me error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// POST /api/auth/register
// ---------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = "candidate"; // 🔥 FORCE candidate role (no errors)

    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password and role required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "12h" });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (err) {
    console.error("REGISTER error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// POST /api/auth/login
// ---------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
