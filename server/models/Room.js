import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    players: [
      {
        username: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
