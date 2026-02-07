
import React, { useState, useEffect, useRef } from 'react';
import { generateSimpleGame } from '../services/geminiService';
import { Game } from '../types';

interface AIStudioProps {
  onGameGenerated: (game: Game) => void;
}

const LOADING_STEPS = [
  "Initializing Arcade Engine...",
  "Architecting Game Loop...",
  "Generating Vector Assets...",
  "Compiling JavaScript Logic...",
  "Injecting Physics Components...",
  "Polishing User Interface...",
  "Finalizing Render Pipeline..."
];

const AIStudio: React.FC<AIStudioProps> = ({ onGameGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const progressTimerRef = useRef<number | null>(null);
  const stepTimerRef = useRef<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStep(0);

    // Simulated progress bar logic
    progressTimerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Hold at 95 until finished
        const inc = Math.random() * 5;
        return Math.min(prev + inc, 95);
      });
    }, 400);

    // Cycle through descriptive steps
    stepTimerRef.current = window.setInterval(() => {
      setCurrentStep(prev => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    try {
      const result = await generateSimpleGame(prompt);
      
      // Complete the progress instantly when data arrives
      setProgress(100);
      window.clearInterval(progressTimerRef.current!);
      window.clearInterval(stepTimerRef.current!);

      const newGame: Game = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title,
        description: result.description,
        category: 'AI Generated',
        htmlContent: result.htmlContent,
        author: 'Gemini AI',
        thumbnail: `https://picsum.photos/seed/${result.title}/400/300`,
        createdAt: Date.now()
      };
      
      // Small delay for visual satisfaction of reaching 100%
      setTimeout(() => {
        onGameGenerated(newGame);
        setPrompt('');
        setIsGenerating(false);
        setProgress(0);
      }, 800);

    } catch (err) {
      console.error(err);
      setError("Failed to generate game. Please try a different prompt.");
      setIsGenerating(false);
      window.clearInterval(progressTimerRef.current!);
      window.clearInterval(stepTimerRef.current!);
    }
  };

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      if (stepTimerRef.current) window.clearInterval(stepTimerRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-12 rounded-[3.5rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden text-center min-h-[500px] flex flex-col justify-center">
        
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] animate-pulse"></div>

        {!isGenerating ? (
          <div className="relative z-10 transition-all duration-500">
            <div className="inline-block p-5 rounded-3xl bg-indigo-500/20 mb-8 text-5xl border border-indigo-500/30 shadow-inner">✨</div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">AI Game Studio</h2>
            <p className="text-xl text-indigo-100/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Describe your idea. Gemini will build the physics, logic, and graphics instantly.
            </p>

            <div className="relative group max-w-2xl mx-auto">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-950/80 backdrop-blur-xl border border-slate-700 px-8 py-7 rounded-[2rem] text-xl outline-none focus:ring-4 focus:ring-indigo-500/20 group-hover:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-2xl"
                placeholder="e.g. A neon-themed pong game with power-ups..."
              />
              <button 
                onClick={handleGenerate}
                disabled={!prompt}
                className="absolute right-3 top-3 bottom-3 px-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/30 active:scale-95"
              >
                Build Game
              </button>
            </div>
            {error && <p className="mt-6 text-red-400 font-bold bg-red-400/10 py-2 px-4 rounded-full inline-block">{error}</p>}
          </div>
        ) : (
          <div className="relative z-10 space-y-12 py-10 transition-all duration-500">
            <div className="space-y-4">
              <div className="text-indigo-400 retro-font text-sm animate-pulse tracking-widest">
                CREATION IN PROGRESS
              </div>
              <h3 className="text-3xl font-black text-white">
                {LOADING_STEPS[currentStep]}
              </h3>
            </div>

            <div className="max-w-md mx-auto relative px-2">
              <div className="h-6 w-full bg-slate-950 rounded-full border border-slate-800 p-1 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 rounded-full transition-all duration-300 relative shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[loading-bar_1s_linear_infinite]"></div>
                </div>
              </div>
              <div className="mt-4 text-slate-400 font-black retro-font text-xl">
                {Math.floor(progress)}%
              </div>
            </div>

            <div className="flex justify-center gap-8">
               <div className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${progress > 25 ? 'bg-indigo-500' : 'bg-slate-800'} transition-colors duration-500`}></div>
                  <span className="text-[10px] text-slate-500 font-bold">LOGIC</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${progress > 50 ? 'bg-indigo-500' : 'bg-slate-800'} transition-colors duration-500`}></div>
                  <span className="text-[10px] text-slate-500 font-bold">ASSETS</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${progress > 75 ? 'bg-indigo-500' : 'bg-slate-800'} transition-colors duration-500`}></div>
                  <span className="text-[10px] text-slate-500 font-bold">RENDER</span>
               </div>
            </div>

            <p className="text-slate-500 text-sm italic max-w-sm mx-auto">
              "Building modern HTML5 games requires writing complex Canvas logic and handling frame-perfect inputs..."
            </p>
          </div>
        )}

        {/* Global Styles for the loading bar stripes */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading-bar {
            from { background-position: 0 0; }
            to { background-position: 40px 0; }
          }
        `}} />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <h4 className="font-bold mb-3 text-indigo-300">Infinite Possibilities</h4>
            <p className="text-slate-500 text-sm">Create anything from simple puzzles to complex physics-based arcade games.</p>
          </div>
          <div className="p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <h4 className="font-bold mb-3 text-indigo-300">Instant Publishing</h4>
            <p className="text-slate-500 text-sm">Once generated, games are immediately available in your personal gallery.</p>
          </div>
          <div className="p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <h4 className="font-bold mb-3 text-indigo-300">Full Control</h4>
            <p className="text-slate-500 text-sm">AI handles the code, you handle the high scores and community events.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudio;
