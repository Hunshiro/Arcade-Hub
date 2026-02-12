import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    htmlContent: { type: String, required: true },
    category: { type: String, default: "AI Generated" },
    author: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mode: { type: String, enum: ["solo", "two-player"], default: "solo" },
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
