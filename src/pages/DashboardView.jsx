import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Clock, History, ChevronDown, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function DashboardView({ decks, setDecks, stats, history }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) return;
    try {
      const { error } = await supabase.from('decks').delete().eq('id', id);
      if (error) throw error;
      setDecks(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting deck:', err.message);
    }
  };

  const accuracy = stats.total_quizzes_taken > 0 
    ? Math.round((stats.total_correct_answers / (stats.total_quizzes_taken * 7)) * 100) // Assuming avg 7 questions per quiz
    : 0;

  return (
    <div className="max-w-6xl w-full mx-auto flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back!</h1>
        <p className="opacity-60 text-lg mt-2 font-medium">Ready for another session? Your progress is looking great.</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card p-6 bg-[var(--color-primary)] text-white flex flex-col justify-between min-h-[160px] shadow-lg">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-lg"><BookOpen size={24} /></div>
            <span className="text-3xl font-black">{history.length}</span>
          </div>
          <div>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Total Decks Finished</p>
            <div className="relative mt-2">
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="text-xs flex items-center gap-1 bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors"
              >
                View History <ChevronDown size={12} className={isHistoryOpen ? 'rotate-180' : ''} />
              </button>
              
              {isHistoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white text-[var(--color-text-main)] rounded-lg shadow-xl z-20 p-2 max-h-48 overflow-y-auto">
                  {history.length > 0 ? history.map((item, i) => (
                    <div key={i} className="text-[10px] p-2 border-b border-gray-100 last:border-0 flex items-center gap-2">
                      <CheckCircle2 size={10} className="text-green-600" />
                      <span className="truncate" title={item.deck_title}>{item.deck_title}</span>
                    </div>
                  )) : <p className="text-[10px] p-2 opacity-50">No history yet</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bento-card p-6 bg-white border-2 border-[var(--color-border-subtle)] flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start text-[var(--color-primary)]">
            <div className="p-2 bg-[#fff5f5] rounded-lg"><Trophy size={24} /></div>
            <span className="text-3xl font-black">{accuracy}%</span>
          </div>
          <div>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Quiz Accuracy</p>
            <p className="text-xs mt-1 opacity-40">{stats.total_quizzes_taken} Quizzes attempted</p>
          </div>
        </div>

        <div className="bento-card p-6 bg-white border-2 border-[var(--color-border-subtle)] flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start text-[var(--color-text-main)]">
            <div className="p-2 bg-gray-100 rounded-lg"><Clock size={24} /></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Last Accessed</p>
            <p className="text-sm mt-1 font-bold truncate text-[var(--color-primary)]" title={stats.last_deck_title || 'None'}>
              {stats.last_deck_title || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Decks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><History size={24} /> Active Study Decks</h2>
          <Link to="/create" className="text-sm font-bold text-[var(--color-primary)] hover:underline">+ New Deck</Link>
        </div>

        {decks.length === 0 ? (
          <div className="bento-card py-20 bg-white text-center border-2 border-dashed border-[var(--color-border-subtle)]">
            <p className="opacity-50 text-lg italic">No active decks. Create one to start studying!</p>
            <Link to="/create" className="mt-4 inline-block px-8 py-3 bg-[var(--color-primary)] text-white rounded-md font-bold hover:opacity-90">Create Your First Deck</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => {
              const progressPercentage = deck.cards.length > 0 ? ((deck.current_index + 1) / deck.cards.length) * 100 : 0;
              
              return (
                <div key={deck.id} className="bento-card bg-white flex flex-col gap-5 hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight line-clamp-1" title={deck.title}>{deck.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="opacity-60 text-xs uppercase tracking-widest font-semibold">{deck.cards.length} Cards</p>
                      {deck.high_score !== undefined && deck.high_score !== null && (
                        <div className="text-[var(--color-primary)] text-xs font-bold flex items-center gap-1 bg-[#fff5f5] px-2 py-0.5 rounded-full border border-[#ffebeb]">
                          ★ {deck.high_score} / {deck.quiz?.length || 0}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    <div className="flex justify-between text-xs opacity-80 font-semibold">
                      <span>{deck.current_index + 1} Completed</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                      <Link 
                        to={`/study/${deck.id}`}
                        className="flex-1 text-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md font-medium text-sm hover:opacity-90 transition-colors"
                      >
                        Study
                      </Link>
                      <Link 
                        to={`/quiz/${deck.id}`}
                        className="flex-1 text-center px-4 py-2 border-2 border-[var(--color-border-subtle)] text-[var(--color-text-main)] rounded-md font-medium text-sm hover:bg-[var(--color-border-subtle)] transition-colors"
                      >
                        Quiz
                      </Link>
                    </div>
                    <button 
                      onClick={() => handleDelete(deck.id)}
                      className="w-full px-4 py-1.5 text-[#ba1a1a] opacity-60 rounded-md font-medium text-xs hover:opacity-100 hover:bg-[#ffdad6] transition-colors"
                    >
                      Delete Deck
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
