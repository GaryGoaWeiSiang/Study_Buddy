import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-text-main)] font-sans p-4">
      <div className="bento-card max-w-md w-full p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Study Buddy</h1>
          <div className="text-xs font-medium opacity-60 uppercase tracking-widest mt-1">Dark Academia</div>
        </div>
        
        <h2 className="text-2xl font-semibold tracking-tight mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-[#ffdad6] text-[#93000a] rounded-md text-sm border border-[#ba1a1a]">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wider uppercase opacity-80">Email</label>
            <input 
              type="email" 
              className="w-full p-3 bg-transparent border-b-2 border-[var(--color-border-subtle)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wider uppercase opacity-80">Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-transparent border-b-2 border-[var(--color-border-subtle)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 w-full py-3 bg-[var(--color-primary)] text-white rounded-md font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm opacity-70">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[var(--color-primary)] font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
