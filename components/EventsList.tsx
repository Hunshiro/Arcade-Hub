
import React from 'react';
import { GameEvent, Game } from '../types';

interface EventsListProps {
  events: GameEvent[];
  games: Game[];
  onPlayGame: (gameId: string) => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, games, onPlayGame }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-2">Live Tournaments</h2>
          <p className="text-slate-400">Join the arena and win epic prizes from top contributors.</p>
        </div>
        <button className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-colors">
          Host Tournament
        </button>
      </div>

      <div className="grid gap-6">
        {events.map((event) => {
          const game = games.find(g => g.id === event.gameId);
          const isFinished = event.status === 'finished';
          
          return (
            <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-8 items-center shadow-xl hover:border-indigo-500/30 transition-all">
              <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden flex-shrink-0 relative">
                <img 
                  src={game?.thumbnail || 'https://picsum.photos/400/300'} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  event.status === 'active' ? 'bg-green-500' : event.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-500'
                }`}>
                  {event.status}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
                    <p className="text-indigo-400 font-medium text-sm">Playing: {game?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Prize Pool</p>
                    <p className="text-2xl font-black text-indigo-400 retro-font">{event.prizePool}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <button 
                    onClick={() => onPlayGame(event.gameId)}
                    disabled={isFinished}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      isFinished 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {isFinished ? 'Tournament Ended' : 'Join Event'}
                  </button>
                  <button className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-colors">
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsList;
