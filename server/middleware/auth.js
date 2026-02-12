import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token." });
  }
  const token = auth.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "Invalid user." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token." });
  }
};
