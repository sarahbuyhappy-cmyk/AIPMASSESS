
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BrainCircuit, Map, Activity, Wrench, MessageSquare, User, Key, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import UserProfileModal from './UserProfileModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Fix: Included setProfileModalOpen in destructuring and removed API key related states
  const { profile, setProfileModalOpen } = useUser();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Activity size={20} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Map size={20} /> },
    { name: 'Assessment', path: '/assessment', icon: <BrainCircuit size={20} /> },
    { name: 'Toolbox', path: '/toolbox', icon: <Wrench size={20} /> },
    { name: 'AI Mentor', path: '/mentor', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-row">
      <UserProfileModal />

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
