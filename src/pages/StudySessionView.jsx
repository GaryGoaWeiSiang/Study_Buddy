import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import Flashcard from '../components/Flashcard';
import { supabase } from '../services/supabase';

export default function StudySessionView({ decks, setDecks, setHistory, setStats }) {
  const { deckId } = useParams();
  
  const activeDeckIndex = decks.findIndex(d => d.id === deckId);
  const activeDeck = decks[activeDeckIndex];

  useEffect(() => {
    if (activeDeck) {
      updateLastAccessed(activeDeck.title);
    }
  }, [deckId, activeDeck?.title]);

  const updateLastAccessed = async (title) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('user_stats').upsert({ 
        user_id: user.id, 
        last_deck_title: title,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      setStats(prev => ({ ...prev, last_deck_title: title }));
    } catch (err) {
      console.error("Error updating last accessed:", err);
    }
  };

  const markAsCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('completion_history').insert({
        user_id: user.id,
        deck_title: activeDeck.title
      }).select().single();
      if (!error && data) setHistory(prev => [data, ...prev]);
    } catch (err) {
      console.error("Error marking as completed:", err);
    }
  };

  if (!deckId) {
    return (
      <div className="max-w-3xl w-full flex flex-col items-center justify-center h-full opacity-50 min-h-[500px]">
        <p className="text-xl">No deck selected.</p>
        <p className="text-sm mt-2">Go to the Dashboard to select a deck or Create Deck to generate flashcards.</p>
      </div>
    );
  }

  if (!activeDeck) {
    return (
      <div className="max-w-3xl w-full flex flex-col items-center justify-center h-full opacity-50 min-h-[500px]">
        <p className="text-xl">Deck not found.</p>
        <Link to="/" className="text-sm mt-2 text-[var(--color-primary)] hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const handleNext = async () => {
    if (activeDeck.current_index >= activeDeck.cards.length - 1) return;
    
    const nextIndex = activeDeck.current_index + 1;

    // If reaching the last card for the first time, record as completed
    if (nextIndex === activeDeck.cards.length - 1) {
      markAsCompleted();
    }
    
    setDecks(prevDecks => {
      const newDecks = [...prevDecks];
      const targetDeck = { ...newDecks[activeDeckIndex] };
      targetDeck.current_index = nextIndex;
      newDecks[activeDeckIndex] = targetDeck;
      return newDecks;
    });

    try {
      await supabase.from('decks').update({ current_index: nextIndex }).eq('id', deckId);
    } catch (err) {
      console.error("Failed to sync progress:", err);
    }
  };

  const handlePrev = async () => {
    if (activeDeck.current_index <= 0) return;
    
    const prevIndex = activeDeck.current_index - 1;
    
    setDecks(prevDecks => {
      const newDecks = [...prevDecks];
      const targetDeck = { ...newDecks[activeDeckIndex] };
      targetDeck.current_index = prevIndex;
      newDecks[activeDeckIndex] = targetDeck;
      return newDecks;
    });

    try {
      await supabase.from('decks').update({ current_index: prevIndex }).eq('id', deckId);
    } catch (err) {
      console.error("Failed to sync progress:", err);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset progress to the beginning of this deck?')) return;
    
    setDecks(prevDecks => {
      const newDecks = [...prevDecks];
      const targetDeck = { ...newDecks[activeDeckIndex] };
      targetDeck.current_index = 0;
      newDecks[activeDeckIndex] = targetDeck;
      return newDecks;
    });

    try {
      await supabase.from('decks').update({ current_index: 0 }).eq('id', deckId);
    } catch (err) {
      console.error("Failed to reset progress:", err);
    }
  };

  const progressPercentage = ((activeDeck.current_index + 1) / activeDeck.cards.length) * 100;

  return (
    <div className="max-w-4xl w-full flex flex-col gap-6 h-full relative">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">{activeDeck.title}</h2>
            <button 
              onClick={handleReset}
              className="p-1.5 opacity-40 hover:opacity-100 hover:bg-black/5 rounded-full transition-all"
              title="Reset Session"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <p className="opacity-70 text-sm">Study Session</p>
        </div>
        <div className="w-1/3 flex flex-col items-end gap-2">
          <span className="text-xs font-semibold tracking-wider opacity-60 uppercase">{activeDeck.current_index + 1} / {activeDeck.cards.length}</span>
          <div className="w-full h-2 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 bento-card relative overflow-hidden min-h-[500px] flex items-center justify-center mt-4">
        <div className="absolute inset-0 glass-panel pointer-events-none z-0 opacity-50" />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <Flashcard 
            card={activeDeck.cards[activeDeck.current_index]} 
            index={activeDeck.current_index} 
            total={activeDeck.cards.length} 
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      </div>
    </div>
  );
}
