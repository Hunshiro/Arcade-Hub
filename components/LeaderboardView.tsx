
import React from 'react';
import { LeaderboardEntry, Game } from '../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  games: Game[];
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboard, games }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-4xl font-black mb-4">The Hall of Fame</h2>
        <p className="text-slate-400">Only the best survive in the digital arena.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[0, 1, 2].map((idx) => {
          const entry = leaderboard[idx];
          if (!entry) return null;
          const game = games.find(g => g.id === entry.gameId);
          return (
            <div key={idx} className={`relative p-8 rounded-3xl border text-center ${
              idx === 0 ? 'bg-indigo-900/40 border-indigo-500 scale-105 shadow-indigo-500/20 shadow-2xl' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-2xl">
                {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
              </div>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-800 overflow-hidden border-4 border-slate-700">
                <img src={`https://picsum.photos/seed/${entry.username}/100/100`} alt="user" />
              </div>
              <h4 className="text-xl font-bold mb-1">{entry.username}</h4>
              <p className="text-slate-400 text-xs mb-4">{game?.title}</p>
              <p className="text-3xl font-black retro-font text-indigo-400">{entry.score}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Rank</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Player</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Game</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic">No scores submitted yet. Be the first!</td>
              </tr>
            ) : (
              leaderboard.map((entry, idx) => (
                <tr key={entry.id} className="hover:bg-indigo-600/5 transition-colors group">
                  <td className="px-8 py-5">
                    <span className={`w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold ${
                      idx < 3 ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={`https://picsum.photos/seed/${entry.username}/100/100`} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                      <span className="font-bold">{entry.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-400 text-sm">
                    {games.find(g => g.id === entry.gameId)?.title || 'Unknown Game'}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-indigo-300 retro-font group-hover:text-indigo-400">
                    {entry.score.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardView;
