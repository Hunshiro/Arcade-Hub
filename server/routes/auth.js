import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/signup", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already taken." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id.toString(), username: user.username } });
  } catch (err) {
    res.status(500).json({ message: "Signup failed." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id.toString(), username: user.username } });
  } catch {
    res.status(500).json({ message: "Login failed." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ id: req.user._id.toString(), username: req.user.username });
});

export default router;
