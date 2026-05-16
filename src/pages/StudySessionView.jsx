import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Flashcard from '../components/Flashcard';
import { supabase } from '../services/supabase';

export default function StudySessionView({ decks, setDecks }) {
  const { deckId } = useParams();
  
  if (!deckId) {
    return (
      <div className="max-w-3xl w-full flex flex-col items-center justify-center h-full opacity-50 min-h-[500px]">
        <p className="text-xl">No deck selected.</p>
        <p className="text-sm mt-2">Go to the Dashboard to select a deck or Create Deck to generate flashcards.</p>
      </div>
    );
  }

  const activeDeckIndex = decks.findIndex(d => d.id === deckId);
  const activeDeck = decks[activeDeckIndex];

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

  const progressPercentage = ((activeDeck.current_index + 1) / activeDeck.cards.length) * 100;

  return (
    <div className="max-w-4xl w-full flex flex-col gap-6 h-full relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{activeDeck.title}</h2>
          <p className="opacity-70 text-sm mt-1">Study Session</p>
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
