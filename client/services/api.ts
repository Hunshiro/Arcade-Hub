const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const jsonHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Request failed.");
  }
  return res.json();
};

export const signup = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const getMe = async (token: string) => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: jsonHeaders(token),
  });
  return handleResponse(res);
};

export const generateGame = async (token: string, prompt: string, mode: "solo" | "two-player") => {
  const res = await fetch(`${API_URL}/api/games/generate`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ prompt, mode }),
  });
  return handleResponse(res);
};

export const joinRoom = async (token: string, roomCode: string) => {
  const res = await fetch(`${API_URL}/api/rooms/join`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ roomCode }),
  });
  return handleResponse(res);
};

export const createRoomForGame = async (
  token: string,
  game: { id?: string; title: string; description: string; htmlContent: string; category?: string; mode?: string }
) => {
  const isMongoObjectId = (value?: string) => !!value && /^[a-f\d]{24}$/i.test(value);
  const useGameId = isMongoObjectId(game.id);

  const res = await fetch(`${API_URL}/api/rooms/create`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({
      gameId: useGameId ? game.id : undefined,
      gameData: useGameId ? undefined : {
        title: game.title,
        description: game.description,
        htmlContent: game.htmlContent,
        category: game.category,
        mode: game.mode
      }
    }),
  });
  return handleResponse(res);
};
