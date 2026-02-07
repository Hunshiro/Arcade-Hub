
export interface Game {
  id: string;
  title: string;
  description: string;
  author: string;
  thumbnail: string;
  htmlContent: string;
  category: string;
  createdAt: number;
}

export interface GameEvent {
  id: string;
  gameId: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  prizePool: string;
  status: 'upcoming' | 'active' | 'finished';
}

export interface LeaderboardEntry {
  id: string;
  gameId: string;
  username: string;
  score: number;
  timestamp: number;
}

export interface User {
  username: string;
  avatar: string;
}
