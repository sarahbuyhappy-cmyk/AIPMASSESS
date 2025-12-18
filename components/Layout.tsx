
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BrainCircuit, Map, Activity, Wrench, MessageSquare, User, Key, ShieldCheck, AlertCircle, X, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import UserProfileModal from './UserProfileModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, setProfileModalOpen, apiKey, setApiKey } = useUser();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [envKeyDetected, setEnvKeyDetected] = useState(false);

  useEffect(() => {
    setTempKey(apiKey);
    setEnvKeyDetected(!!process.env.API_KEY);
  }, [apiKey]);

  const handleSaveKey = () => {
    setApiKey(tempKey.trim());
    setIsKeyModalOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Activity size={20} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Map size={20} /> },
    { name: 'Assessment', path: '/assessment', icon: <BrainCircuit size={20} /> },
    { name: 'PM Toolbox', path: '/toolbox', icon: <Wrench size={20} /> },
    { name: 'AI Mentor', path: '/mentor', icon: <MessageSquare size={20} /> },
  ];

  const hasActiveKey = apiKey.length > 5 || envKeyDetected;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-row">
      <UserProfileModal />

      {/* Manual API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
             <div className="flex justify-between items-center mb-2">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <Key className="text-blue-400" size={20} /> API Configuration
               </h2>
               <button onClick={() => setIsKeyModalOpen(false)} className="text-slate-500 hover:text-white">
                 <X size={24} />
               </button>
             </div>
             
             <p className="text-sm text-slate-400">
               If you are seeing an API Key error, please paste your Gemini API Key here. It will be saved locally in your browser.
             </p>

             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Gemini API Key</label>
               <input 
                 type="password"
                 value={tempKey}
                 onChange={(e) => setTempKey(e.target.value)}
                 placeholder="AIzaSy..."
                 className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
               />
               <p className="text-[10px] text-slate-500">
                 Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 underline">Google AI Studio</a>.
               </p>
             </div>

             <div className="pt-4 flex gap-3">
               <button 
                 onClick={() => setIsKeyModalOpen(false)}
                 className="flex-1 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSaveKey}
                 className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg"
               >
                 Save & Connect
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            AI PM Forge
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* API Key Connection Button */}
        <div className="px-4 py-2">
           <button 
             onClick={() => setIsKeyModalOpen(true)}
             className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-xs font-bold ${
               hasActiveKey 
               ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10' 
               : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 animate-pulse shadow-lg shadow-amber-900/20'
             }`}
           >
              <div className="flex items-center gap-2">
                {hasActiveKey ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                {hasActiveKey ? 'API READY' : 'CONNECT KEY'}
              </div>
              <Settings size={14} className={hasActiveKey ? "opacity-50" : "animate-bounce"} />
           </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={() => setProfileModalOpen(true)}
             className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all text-left group"
           >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                 {profile?.name ? profile.name[0].toUpperCase() : <User size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-sm font-bold text-white truncate">{profile?.name || 'Guest User'}</div>
                 <div className="text-xs text-slate-500 truncate group-hover:text-blue-400 transition-colors">
                    {profile?.role ? `${profile.role} • ${profile.industry}` : 'Complete your profile'}
                 </div>
              </div>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-900">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
