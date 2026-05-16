import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import CreateDeckView from './pages/CreateDeckView';
import StudySessionView from './pages/StudySessionView';
import LoginView from './pages/LoginView';

function App() {
  const [session, setSession] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchDecks();
    } else {
      setDecks([]);
    }
  }, [session]);

  const fetchDecks = async () => {
    try {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDecks(data || []);
    } catch (error) {
      console.error('Error fetching decks:', error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-primary)] font-bold tracking-widest uppercase">Initializing...</div>;
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-[var(--color-surface)] text-[var(--color-text-main)] font-sans">
        <Sidebar user={session.user} />
        
        <main className="flex-1 p-8 md:p-12 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardView decks={decks} setDecks={setDecks} />} />
            <Route path="/create" element={<CreateDeckView setDecks={setDecks} userId={session.user.id} />} />
            <Route path="/study/:deckId?" element={<StudySessionView decks={decks} setDecks={setDecks} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
