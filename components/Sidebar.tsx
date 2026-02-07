
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'games', label: 'Arcade', icon: '🎮' },
    { id: 'events', label: 'Tournaments', icon: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '📈' },
    { id: 'ai-studio', label: 'AI Studio', icon: '✨' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
      <div className="p-8">
        <h1 className="text-2xl font-bold retro-font text-white bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          ARCADE
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Current Event</p>
          <p className="font-bold">Cyber Sprint</p>
          <div className="mt-2 h-1 w-full bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/3"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
