import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const joinRoomSocket = (
  roomCode: string,
  username: string,
  onUpdate: (players: string[]) => void,
  onError?: (message: string) => void
) => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 10000,
    });
  }

  socket.off("room_update");
  socket.off("room_error");
  socket.off("connect_error");

  socket.on("room_update", (payload: { players: string[] }) => {
    onUpdate(payload.players);
  });

  socket.on("room_error", (payload: { message: string }) => {
    onError?.(payload.message);
  });

  socket.on("connect_error", () => {
    onError?.("Socket connection failed. Retrying...");
  });

  const emitJoin = () => socket?.emit("join_room", { roomCode, username });
  if (socket.connected) {
    emitJoin();
  } else {
    socket.once("connect", emitJoin);
  }
};

export const leaveRoomSocket = (roomCode?: string, username?: string) => {
  if (!socket) return;
  if (roomCode && username) {
    socket.emit("leave_room", { roomCode, username });
  }
  socket.off("room_input");
  socket.disconnect();
  socket = null;
};

export type RoomInputPayload = {
  type: "keydown" | "keyup";
  key: string;
  code: string;
};

export const sendRoomInput = (roomCode: string, input: RoomInputPayload) => {
  if (!socket || !socket.connected) return;
  socket.emit("room_input", { roomCode, input });
};

export const subscribeRoomInput = (handler: (input: RoomInputPayload) => void) => {
  if (!socket) return () => {};
  socket.off("room_input");
  socket.on("room_input", (payload: { input?: RoomInputPayload }) => {
    if (!payload?.input) return;
    handler(payload.input);
  });
  return () => {
    socket?.off("room_input");
  };
};
