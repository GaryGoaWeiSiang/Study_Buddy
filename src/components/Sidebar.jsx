import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, LogOut } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Sidebar({ user }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Create Deck', path: '/create', icon: <PlusCircle size={20} /> },
    { name: 'Study Session', path: '/study', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="w-64 border-r border-[var(--color-border-subtle)] h-screen sticky top-0 bg-[var(--color-surface)] flex flex-col py-8 px-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Study Buddy</h1>
        <div className="text-xs font-medium opacity-60 uppercase tracking-widest mt-1">Dark Academia</div>
      </div>
      
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-main)] hover:bg-[var(--color-border-subtle)] opacity-80 hover:opacity-100'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto border-t border-[var(--color-border-subtle)] pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-sm font-medium line-clamp-1 opacity-80">{user?.email}</div>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors font-medium text-sm text-[#ba1a1a] hover:bg-[#ffdad6] opacity-80 hover:opacity-100"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
