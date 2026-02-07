
import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../types';

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
  onScoreSubmit: (score: number) => void;
}

const GamePlayer: React.FC<GamePlayerProps> = ({ game, onClose, onScoreSubmit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Focus the iframe automatically when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SCORE_UPDATE') {
        const score = Number(event.data.score);
        setCurrentScore(score);
        onScoreSubmit(score);
      }
    };

    window.addEventListener('message', handleMessage);
    
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    // Track if user clicked away
    const handleWindowBlur = () => setIsFocused(false);
    const handleWindowFocus = () => setIsFocused(true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [onScoreSubmit]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleContainerClick = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      setIsFocused(true);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h3 className="text-3xl font-black tracking-tight">{game.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                {isFocused ? 'Input Active' : 'Click Game to Focus'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Live Score</p>
              <p className="text-2xl font-black text-indigo-400 retro-font leading-none mt-1">{currentScore}</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <button 
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl transition-all group"
              title="Fullscreen Mode"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className={`flex-1 bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-slate-900 group cursor-pointer transition-all ${isFullscreen ? 'rounded-none border-0' : ''} ${!isFocused ? 'ring-4 ring-indigo-500/30' : ''}`}
      >
        <iframe
          ref={iframeRef}
          srcDoc={game.htmlContent}
          className="w-full h-full border-none bg-slate-950"
          title={game.title}
          sandbox="allow-scripts allow-modals allow-same-origin allow-pointer-lock"
        />
        
        {!isFocused && !isFullscreen && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-opacity">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black retro-font text-xs animate-bounce shadow-2xl">
              CLICK TO FOCUS CONTROLS
            </div>
          </div>
        )}

        {isFullscreen && (
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="px-6 py-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4">
               <h4 className="font-black text-white">{game.title}</h4>
               <span className="text-indigo-400 font-mono text-xl">{currentScore}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="pointer-events-auto p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-indigo-600 transition-colors"
            >
              Exit Fullscreen
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <h4 className="font-black mb-3 uppercase text-xs text-indigo-400 tracking-widest">About this game</h4>
          <p className="text-slate-300 leading-relaxed italic">"{game.description}"</p>
          <div className="mt-6 p-4 bg-slate-800/40 rounded-2xl text-xs text-slate-400 leading-relaxed border border-slate-700">
            <strong>Pro Tip:</strong> If keys aren't working, click inside the game area once. Use Fullscreen mode for the best experience.
          </div>
        </div>
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 flex flex-col">
          <h4 className="font-black mb-4 uppercase text-xs text-indigo-400 tracking-widest">Gamer Status</h4>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-sm">
               <span className="text-slate-500">Session Quality</span>
               <span className="text-green-400 font-bold">Stable</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span className="text-slate-500">Latency</span>
               <span className="text-slate-300 font-mono">0.4ms</span>
             </div>
             <button className="w-full mt-2 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-sm font-bold transition-colors">
               Report Bug
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlayer;
