
import React from 'react';
import { Game } from '../types';

interface DashboardProps {
  games: Game[];
  onPlay: (game: Game) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ games, onPlay }) => {
  return (
    <div className="space-y-12 pb-20">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-900 to-slate-950 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl group">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Global Release
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">Enter the Arena. <br/>Claim the Glory.</h2>
          <p className="text-indigo-100/70 text-lg mb-8 max-w-lg leading-relaxed">Join thousands of players in our competitive HTML5 ecosystem. High-stakes tournaments and AI building tools at your fingertips.</p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-indigo-950 font-black rounded-2xl hover:scale-105 transition-transform shadow-xl">
              Play Featured
            </button>
            <button className="px-8 py-4 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-colors">
              Tournament List
            </button>
          </div>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-2/3 h-[140%] bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-20 rotate-6 mix-blend-overlay group-hover:scale-110 transition-transform duration-[3s]"></div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-3xl font-black tracking-tight">Game Gallery</h3>
            <p className="text-slate-500 text-sm mt-1">Discover community favorites and new releases</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All Genres', 'Action', 'Strategy', 'Retro', 'Puzzle'].map((cat, i) => (
              <button key={cat} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="group bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 active:scale-95"
              onClick={() => onPlay(game)}
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                   <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-wider text-indigo-400">
                     {game.category}
                   </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{game.title}</h4>
                <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed opacity-80">{game.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold">
                      {game.author[0]}
                    </div>
                    <span className="text-xs text-slate-500">by <span className="text-slate-300">{game.author}</span></span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400">
                    <span className="text-xs font-black uppercase">Play</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

