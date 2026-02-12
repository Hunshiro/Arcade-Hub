import Room from "./models/Room.js";

export const attachSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_room", async ({ roomCode, username }) => {
      if (!roomCode || !username) return;
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) {
          socket.emit("room_error", { message: "Room not found." });
          return;
        }

        socket.join(roomCode);
        const exists = room.players.some((p) => p.username === username);
        if (!exists) {
          room.players.push({ username, joinedAt: new Date() });
          await room.save();
        }

        io.to(roomCode).emit("room_update", {
          roomCode,
          players: room.players.map((p) => p.username),
        });
      } catch (err) {
        socket.emit("room_error", { message: "Failed to join room." });
      }
    });

    socket.on("leave_room", async ({ roomCode, username }) => {
      if (!roomCode || !username) return;
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;
        room.players = room.players.filter((p) => p.username !== username);
        await room.save();
        socket.leave(roomCode);
        io.to(roomCode).emit("room_update", {
          roomCode,
          players: room.players.map((p) => p.username),
        });
      } catch {
        // ignore
      }
    });

    socket.on("room_input", ({ roomCode, input }) => {
      if (!roomCode || !input) return;
      if (!socket.rooms.has(roomCode)) return;
      socket.to(roomCode).emit("room_input", { input });
    });
  });
};
