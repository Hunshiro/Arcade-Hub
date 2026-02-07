
import React, { useState, useEffect, useCallback } from 'react';
import { Game, GameEvent, LeaderboardEntry, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GamePlayer from './components/GamePlayer';
import EventsList from './components/EventsList';
import LeaderboardView from './components/LeaderboardView';
import UploadModal from './components/UploadModal';
import AIStudio from './components/AIStudio';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';

const INITIAL_GAMES: Game[] = [
  {
    id: '1',
    title: 'Neon Runner',
    description: 'A fast-paced dodge-and-dash game set in a synthwave world.',
    author: 'ArcadeAdmin',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400',
    category: 'Action',
    createdAt: Date.now(),
    htmlContent: `
      <!DOCTYPE html><html><body style="background:#000;color:#0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;overflow:hidden">
      <h1 id="score" style="position:fixed;top:10px;left:10px;margin:0">Score: 0</h1>
      <canvas id="g" width="800" height="600" style="background:#111;max-width:95vw;max-height:95vh"></canvas>
      <script>
        const c=document.getElementById('g'),ctx=c.getContext('2d');
        let s=0,px=400,py=550,o=[],t=0;
        function update(){
          ctx.fillStyle='#000';ctx.fillRect(0,0,800,600);
          ctx.fillStyle='#0f0';ctx.fillRect(px-20,py-20,40,40);
          if(t%20==0)o.push({x:Math.random()*800,y:0,w:Math.random()*40+20});
          o.forEach((e,i)=>{
            e.y+=7;ctx.fillStyle='#f0f';ctx.fillRect(e.x-e.w/2,e.y-10,e.w,20);
            if(Math.hypot(px-e.x,py-e.y)<35){alert('Game Over! Score: '+s);window.parent.postMessage({type:'SCORE_UPDATE',score:s},'*');s=0;o=[];}
            if(e.y>600){o.splice(i,1);s++;document.getElementById('score').innerText='Score: '+s;}
          });
          t++;requestAnimationFrame(update);
        }
        window.onmousemove=e=>{const r=c.getBoundingClientRect();px=(e.clientX-r.left)*(800/r.width);};
        update();
      </script></body></html>`
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'events' | 'leaderboard' | 'ai-studio'>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ah_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedGames = localStorage.getItem('ah_games');
    const savedEvents = localStorage.getItem('ah_events');
    const savedLeaderboard = localStorage.getItem('ah_leaderboard');

    setGames(savedGames ? JSON.parse(savedGames) : INITIAL_GAMES);
    setEvents(savedEvents ? JSON.parse(savedEvents) : [{
      id: 'e1',
      gameId: '1',
      title: 'Cyber Sprint 2024',
      description: 'Compete for the highest score in Neon Runner and win 500 Credits!',
      startTime: Date.now() - 3600000,
      endTime: Date.now() + 86400000,
      prizePool: '500 ARC',
      status: 'active'
    }]);
    setLeaderboard(savedLeaderboard ? JSON.parse(savedLeaderboard) : []);
  }, []);

  const handleSignIn = (username: string) => {
    const newUser = { username, avatar: `https://picsum.photos/seed/${username}/100/100` };
    setUser(newUser);
    localStorage.setItem('ah_user', JSON.stringify(newUser));
    setShowSignIn(false);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('ah_user');
    setSelectedGame(null);
  };

  const submitScore = useCallback((gameId: string, score: number) => {
    if (!user) return;
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substr(2, 9),
      gameId,
      username: user.username,
      score,
      timestamp: Date.now()
    };
    const updated = [newEntry, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 100);
    setLeaderboard(updated);
    localStorage.setItem('ah_leaderboard', JSON.stringify(updated));
  }, [user, leaderboard]);

  if (!user && !showSignIn) {
    return <LandingPage onGetStarted={() => setShowSignIn(true)} />;
  }

  if (showSignIn) {
    return <SignIn onSignIn={handleSignIn} onBack={() => setShowSignIn(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedGame(null);
        }} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-indigo-400 retro-font tracking-tight">
            {activeTab.toUpperCase()}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              Upload Game
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">{user?.username}</span>
              <button 
                onClick={handleSignOut}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img src={user?.avatar} alt="avatar" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {selectedGame ? (
            <GamePlayer 
              game={selectedGame} 
              onClose={() => setSelectedGame(null)} 
              onScoreSubmit={(score) => submitScore(selectedGame.id, score)}
            />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'games' && <Dashboard games={games} onPlay={setSelectedGame} />}
              {activeTab === 'events' && <EventsList events={events} games={games} onPlayGame={(id) => setSelectedGame(games.find(g => g.id === id) || null)} />}
              {activeTab === 'leaderboard' && <LeaderboardView leaderboard={leaderboard} games={games} />}
              {activeTab === 'ai-studio' && <AIStudio onGameGenerated={(g) => { setGames([g, ...games]); setActiveTab('games'); }} />}
            </div>
          )}
        </div>
      </main>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUpload={(g) => { setGames([g, ...games]); setIsUploadOpen(false); }} 
        />
      )}
    </div>
  );
};

export default App;
