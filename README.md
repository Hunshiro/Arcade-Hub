# Arcade Hub

Arcade Hub is a full-stack web app where users can generate browser-playable mini-games with Gemini, then play solo or host/join real-time two-player rooms.

## What This Project Does

- User authentication with JWT (`signup`, `login`, `me`)
- AI game generation from a prompt
- Storage of generated games in MongoDB
- Two-player room creation and join flow with room codes
- Real-time player presence + synced keyboard input using Socket.IO

## Tech Stack

### Client
- React 19 + TypeScript
- Vite
- TailwindCSS
- Socket.IO client

### Server
- Node.js + Express
- MongoDB + Mongoose
- JWT auth + bcrypt password hashing
- Socket.IO server
- Gemini API (`@google/genai`) for game generation

## Repository Structure

```text
Arcade-Hub/
|- client/                 # React app
|  |- components/          # UI components (Dashboard, GamePlayer, etc.)
|  |- services/            # API and socket clients
|  |- App.tsx              # Main app state/orchestration
|  `- package.json
|- server/                 # Express + Socket.IO API
|  |- models/              # Mongoose models (User, Game, Room)
|  |- routes/              # REST routes
|  |- middleware/          # Auth middleware
|  |- services/            # Gemini integration
|  |- socket.js            # Real-time room handlers
|  |- index.js             # Server bootstrap
|  `- package.json
|- package.json            # Root workspace scripts
`- README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas URI (or local MongoDB)
- Gemini API key

## Environment Variables

Create `server/.env`:

```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=replace_with_your_gemini_key
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_GEMINI_API_KEY=replace_with_your_gemini_key
```

Notes:
- `VITE_API_URL` points the frontend to the backend.
- `VITE_GEMINI_API_KEY` is required by `client/services/geminiService.ts`.
- Do not commit `.env` files.

## Install Dependencies

From the repo root:

```bash
npm install
```

This repo uses npm workspaces, so root install handles dependencies for `client` and `server`.

## Run Locally

Run backend:

```bash
npm run server
```

Run frontend in a second terminal:

```bash
npm run dev
```

Open:
- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/health`

## Available Scripts

From repo root:

- `npm run dev` -> starts client Vite dev server
- `npm run build` -> builds client production bundle
- `npm run preview` -> previews client build
- `npm run server` or `npm run dev:server` -> starts backend server

From `client/`:
- `npm run dev | build | preview`

From `server/`:
- `npm run dev`

## Authentication Flow

1. Client calls `POST /api/auth/signup` or `POST /api/auth/login`.
2. Server returns JWT token.
3. Client stores token and sends `Authorization: Bearer <token>` for protected routes.
4. `GET /api/auth/me` validates token and returns user profile.

## API Overview

Base URL: `http://localhost:4000`

### Health
- `GET /health`

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth required)

### Games
- `POST /api/games/generate` (auth required)
  - Input: `prompt`, `mode` (`solo` or `two-player`)
  - Output: generated game object and optional `roomCode`

### Rooms
- `POST /api/rooms/create` (auth required)
  - Create room from an existing `gameId` or inline `gameData`
- `POST /api/rooms/join` (auth required)
  - Input: `roomCode`
  - Output: room players + game payload

## Socket Events

Socket server runs on the same host/port as the API.

Client emits:
- `join_room` -> `{ roomCode, username }`
- `leave_room` -> `{ roomCode, username }`
- `room_input` -> `{ roomCode, input }`

Server emits:
- `room_update` -> `{ roomCode, players }`
- `room_error` -> `{ message }`
- `room_input` -> relays input to the other player in room

## Data Model Summary

- `User`: username + password hash
- `Game`: generated game metadata + HTML payload + owner
- `Room`: room code + linked game + player list

## Troubleshooting

- Server exits immediately: verify `MONGO_URI` exists and is valid in `server/.env`.
- 401 on protected routes: token missing/expired or invalid `JWT_SECRET`.
- Client cannot reach server: check `VITE_API_URL` and confirm backend runs on `PORT`.
- Game generation fails: verify `GEMINI_API_KEY` and Gemini quota.
- Real-time sync not working: ensure socket connects to same backend URL as REST API.

## Security Notes

- Rotate any keys that were accidentally exposed.
- Keep `.env` files local.
- Use a strong `JWT_SECRET` in production.
- Restrict CORS origin in production (server currently allows `*`).

## Deployment Notes

Typical split deployment:
- Client: Vercel/Netlify/static host
- Server: Render/Railway/Fly.io/VM
- Database: MongoDB Atlas

Set production environment variables on your host and update `VITE_API_URL` to your deployed backend URL.

## License

Add your preferred license (MIT, Apache-2.0, etc.) in a `LICENSE` file.
