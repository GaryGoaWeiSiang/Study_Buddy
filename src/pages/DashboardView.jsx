import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function DashboardView({ decks, setDecks }) {
  
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('decks').delete().eq('id', id);
      if (error) throw error;
      setDecks(prev => prev.filter(deck => deck.id !== id));
    } catch (err) {
      console.error("Failed to delete deck:", err);
    }
  };

  return (
    <div className="max-w-6xl w-full flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        <p className="opacity-70 mt-1">Manage your study decks and track your progress.</p>
      </div>
      
      {decks.length === 0 ? (
        <div className="bento-card flex flex-col items-center justify-center py-16 opacity-60">
          <p className="text-lg font-medium">No active decks found.</p>
          <p className="text-sm mt-1">Head over to "Create Deck" to generate your first study session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => {
            const progressPercentage = deck.cards.length > 0 ? ((deck.current_index + 1) / deck.cards.length) * 100 : 0;
            
            return (
              <div key={deck.id} className="bento-card flex flex-col gap-5 hover:shadow-md transition-shadow">
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
  );
}
