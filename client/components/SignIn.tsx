
import React, { useState } from 'react';
import { login, signup } from '../services/api';
import { User } from '../types';

interface SignInProps {
  onAuthSuccess: (token: string, user: User) => void;
  onBack: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onAuthSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = mode === 'login'
        ? await login(username.trim(), password)
        : await signup(username.trim(), password);
      const user: User = {
        id: res.user?.id,
        username: res.user?.username || username.trim(),
        avatar: `https://picsum.photos/seed/${username.trim()}/100/100`
      };
      onAuthSuccess(res.token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_100%)]"></div>
       
       <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10">
         <button 
           onClick={onBack}
           className="mb-8 text-slate-500 hover:text-white flex items-center gap-2 transition-colors text-sm font-bold"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
           </svg>
           BACK
         </button>

         <h2 className="text-3xl font-black mb-2">
           {mode === 'login' ? 'Welcome Back' : 'Create Account'}
         </h2>
         <p className="text-slate-400 mb-8">
           {mode === 'login'
             ? 'Log in to access your arcade profile.'
             : 'Create your arcade profile to save games and rooms.'}
         </p>

         <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2 ml-1">
               Gamer Tag
             </label>
             <input 
               type="text" 
               autoFocus
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               placeholder="PlayerOne"
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
               required
             />
           </div>
           <div>
             <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2 ml-1">
               Password
             </label>
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
               required
             />
           </div>

           <button 
             type="submit"
             disabled={isLoading}
             className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
           >
             {isLoading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}
           </button>
         </form>

         {error && (
           <p className="mt-6 text-center text-red-400 text-sm font-bold">{error}</p>
         )}

         <div className="mt-6 text-center text-sm text-slate-500">
           {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
           <button
             type="button"
             onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
             className="text-indigo-400 hover:text-indigo-300 font-bold"
           >
             {mode === 'login' ? 'Create one' : 'Log in'}
           </button>
         </div>

         <p className="mt-8 text-center text-slate-500 text-xs">
           By continuing, you agree to our digital arena terms. No private data is stored permanently.
         </p>
       </div>
    </div>
  );
};

export default SignIn;

