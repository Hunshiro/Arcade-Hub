import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Game from "../models/Game.js";
import Room from "../models/Room.js";
import { generateSimpleGame } from "../services/geminiService.js";
import { customAlphabet } from "nanoid";

const router = express.Router();
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

router.post("/generate", requireAuth, async (req, res) => {
  const { prompt, mode } = req.body ?? {};
  if (!prompt) return res.status(400).json({ message: "Prompt required." });
  const safeMode = mode === "two-player" ? "two-player" : "solo";

  try {
    const result = await generateSimpleGame(prompt);
    const game = await Game.create({
      title: result.title,
      description: result.description,
      htmlContent: result.htmlContent,
      author: req.user.username,
      ownerId: req.user._id,
      mode: safeMode,
    });

    let roomCode = null;
    if (safeMode === "two-player") {
      roomCode = nanoid();
      await Room.create({
        roomCode,
        gameId: game._id,
        ownerId: req.user._id,
        players: [{ username: req.user.username }],
      });
    }

    res.json({
      game: {
        id: game._id.toString(),
        title: game.title,
        description: game.description,
        htmlContent: game.htmlContent,
        category: game.category,
        author: game.author,
        mode: game.mode,
        createdAt: game.createdAt.getTime(),
      },
      roomCode,
    });
  } catch (err) {
    console.error("Game generation error:", err);
    res.status(500).json({ message: "Game generation failed." });
  }
});

export default router;
