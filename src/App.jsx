import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import CreateDeckView from './pages/CreateDeckView';
import StudySessionView from './pages/StudySessionView';
import QuizView from './pages/QuizView';
import LoginView from './pages/LoginView';

function App() {
  const [session, setSession] = useState(null);
  const [decks, setDecks] = useState([]);
  const [stats, setStats] = useState({ total_quizzes_taken: 0, total_correct_answers: 0, total_questions_attempted: 0, last_deck_title: 'None' });
  const [history, setHistory] = useState([]);
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
      fetchInitialData();
    } else {
      setDecks([]);
      setStats({ total_quizzes_taken: 0, total_correct_answers: 0, last_deck_title: 'None' });
      setHistory([]);
    }
  }, [session]);

  const fetchInitialData = async () => {
    try {
      // Fetch Decks
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });
      if (deckError) throw deckError;
      setDecks(deckData || []);

      // Fetch Stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .single();
      if (!statsError && statsData) setStats(statsData);

      // Fetch History
      const { data: historyData, error: historyError } = await supabase
        .from('completion_history')
        .select('*')
        .order('completed_at', { ascending: false });
      if (!historyError && historyData) setHistory(historyData);
    } catch (error) {
      console.error('Error fetching initial data:', error.message);
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
            <Route path="/" element={<DashboardView decks={decks} setDecks={setDecks} stats={stats} history={history} />} />
            <Route path="/create" element={<CreateDeckView setDecks={setDecks} userId={session.user.id} setStats={setStats} />} />
            <Route path="/study/:deckId?" element={<StudySessionView decks={decks} setDecks={setDecks} setHistory={setHistory} setStats={setStats} />} />
            <Route path="/quiz/:deckId" element={<QuizView decks={decks} setDecks={setDecks} setStats={setStats} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
