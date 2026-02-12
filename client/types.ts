
export interface Game {
  id: string;
  title: string;
  description: string;
  author: string;
  thumbnail: string;
  htmlContent: string;
  category: string;
  createdAt: number;
  mode?: 'solo' | 'two-player';
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
  id?: string;
  username: string;
  avatar: string;
}
