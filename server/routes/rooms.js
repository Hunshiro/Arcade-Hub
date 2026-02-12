import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Room from "../models/Room.js";
import Game from "../models/Game.js";
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";

const router = express.Router();
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

router.post("/create", requireAuth, async (req, res) => {
  const { gameId, gameData } = req.body ?? {};

  try {
    let game = null;
    if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
      game = await Game.findById(gameId);
    } else if (gameData) {
      if (!gameData.htmlContent || !gameData.title) {
        return res.status(400).json({ message: "Game data is incomplete." });
      }
      game = await Game.create({
        title: gameData.title,
        description: gameData.description || "Two-player arcade match.",
        htmlContent: gameData.htmlContent,
        category: gameData.category || "Two Player",
        author: req.user.username,
        ownerId: req.user._id,
        mode: "two-player",
      });
    }

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (game.mode !== "two-player") {
      return res.status(400).json({ message: "Room creation is only for two-player games." });
    }

    const roomCode = nanoid();
    const room = await Room.create({
      roomCode,
      gameId: game._id,
      ownerId: req.user._id,
      players: [{ username: req.user.username }],
    });

    res.json({
      roomCode: room.roomCode,
      players: room.players.map((p) => p.username),
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
    });
  } catch (err) {
    res.status(500).json({ message: "Room creation failed." });
  }
});

router.post("/join", requireAuth, async (req, res) => {
  const { roomCode } = req.body ?? {};
  if (!roomCode) return res.status(400).json({ message: "Room code required." });

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: "Room not found." });

    const exists = room.players.some((p) => p.username === req.user.username);
    if (!exists) {
      room.players.push({ username: req.user.username });
      await room.save();
    }

    const game = await Game.findById(room.gameId);
    if (!game) return res.status(404).json({ message: "Game not found." });

    res.json({
      roomCode: room.roomCode,
      players: room.players.map((p) => p.username),
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
    });
  } catch {
    res.status(500).json({ message: "Join room failed." });
  }
});

export default router;
