
import React, { useState } from 'react';

interface SignInProps {
  onSignIn: (username: string) => void;
  onBack: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onBack }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onSignIn(username.trim());
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

         <h2 className="text-3xl font-black mb-2">Initialize Profile</h2>
         <p className="text-slate-400 mb-8">Enter your alias to enter the arcade and track your scores.</p>

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

           <button 
             type="submit"
             className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
           >
             Continue to Arcade
           </button>
         </form>

         <p className="mt-8 text-center text-slate-500 text-xs">
           By continuing, you agree to our digital arena terms. No private data is stored permanently.
         </p>
       </div>
    </div>
  );
};

export default SignIn;
