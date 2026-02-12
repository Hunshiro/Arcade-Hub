import http from "http";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import roomRoutes from "./routes/rooms.js";
import { attachSocketHandlers } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/rooms", roomRoutes);

attachSocketHandlers(io);

const { MONGO_URI, PORT = 4000 } = process.env;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI in environment.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    server.listen(Number(PORT), () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
