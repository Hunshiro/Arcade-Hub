
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[120px] rounded-full"></div>

      <nav className="h-20 flex items-center justify-between px-8 md:px-20 relative z-10 border-b border-white/5 backdrop-blur-md">
        <h1 className="text-2xl font-black retro-font bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ARCADEHUB
        </h1>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all shadow-lg shadow-indigo-600/20"
        >
          Enter the Arena
        </button>
      </nav>

      <main className="relative z-10 px-8 pt-20 md:pt-32 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
            Next Gen Web Gaming
          </span>
          <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Play. Compete. <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Build with AI.
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The world's first decentralized arcade powered by Gemini. Upload your HTML5 creations, join high-stakes tournaments, or let AI build your next game in seconds.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="w-full md:w-auto px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 transition-transform text-lg"
            >
              Get Started for Free
            </button>
            <button className="w-full md:w-auto px-10 py-5 bg-slate-900 border border-white/10 text-white font-black rounded-2xl hover:bg-slate-800 transition-colors text-lg">
              Browse Games
            </button>
          </div>
        </div>

        {/* Floating Game Preview Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-700 pb-20">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl transform rotate-3 hover:rotate-0 transition-transform">
              <div className="aspect-video rounded-2xl bg-slate-800 mb-4 overflow-hidden">
                <img src={`https://picsum.photos/seed/landing${i}/400/250`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="h-4 w-2/3 bg-white/10 rounded-full mb-2"></div>
              <div className="h-4 w-1/2 bg-white/5 rounded-full"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

