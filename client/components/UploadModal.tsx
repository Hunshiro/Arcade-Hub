
import React, { useState } from 'react';
import { Game } from '../types';
import { curateGameDescription } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (game: Game) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [isCurating, setIsCurating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        setHtmlContent(text);
        
        // Auto-curate using AI
        setIsCurating(true);
        try {
          const curated = await curateGameDescription(text);
          setTitle(curated.title);
          setDescription(curated.description);
          setCategory(curated.category);
        } catch (err) {
          console.error("AI curation failed", err);
        } finally {
          setIsCurating(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent || !title) return;

    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      category,
      htmlContent,
      author: 'You',
      thumbnail: `https://picsum.photos/seed/${title}/400/300`,
      createdAt: Date.now()
    };

    onUpload(newGame);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-black">Ship Your Game</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">HTML File</span>
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".html" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="game-file"
                />
                <label 
                  htmlFor="game-file" 
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer group-hover:border-indigo-500/50 bg-slate-800/30 transition-all"
                >
                  <svg className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-slate-300 font-medium">Click to select HTML file</span>
                  <span className="text-slate-500 text-xs mt-1">Single-file HTML games only</span>
                </label>
              </div>
            </label>

            {isCurating && (
              <div className="p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-indigo-300 font-medium italic">AI is curating your game's details...</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">Game Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Super Mario Clone"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option>Action</option>
                  <option>Puzzle</option>
                  <option>Arcade</option>
                  <option>Racing</option>
                  <option>Strategy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="Briefly describe what makes your game awesome..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!htmlContent || !title}
              className="flex-[2] px-6 py-4 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              Publish Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

