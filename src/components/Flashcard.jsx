import React, { useState, useEffect } from 'react';

export default function Flashcard({ card, index, total, onNext, onPrev }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
      <div 
        className="relative w-full aspect-[4/3] cursor-pointer group [perspective:1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`absolute w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
          {/* Front */}
          <div className="absolute w-full h-full [backface-visibility:hidden] bento-card flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="absolute top-6 left-6 text-sm font-semibold opacity-50 tracking-wider">CARD {index + 1} OF {total}</span>
            <p className="text-2xl font-medium px-8">{card.front}</p>
            <span className="absolute bottom-6 text-sm opacity-40">Tap to flip</span>
          </div>
          
          {/* Back */}
          <div className="absolute w-full h-full [backface-visibility:hidden] bento-card flex flex-col items-center justify-center text-center bg-[#f4f4f0] [transform:rotateY(180deg)]">
            <span className="absolute top-6 left-6 text-sm font-semibold text-[var(--color-primary)] tracking-wider">ANSWER</span>
            <p className="text-xl px-8">{card.back}</p>
            <span className="absolute bottom-6 text-sm opacity-40">Tap to flip back</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between w-full mt-2">
         <button 
           disabled={index === 0}
           className={`px-6 py-2 border border-[var(--color-border-subtle)] rounded-md transition-colors font-medium text-sm ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black/5'}`}
           onClick={(e) => { e.stopPropagation(); onPrev && onPrev(); }}
         >
           ← Previous
         </button>

         {index < total - 1 ? (
           <button 
             className="px-6 py-2 border border-[var(--color-border-subtle)] rounded-md hover:bg-black/5 transition-colors font-medium text-sm"
             onClick={(e) => { e.stopPropagation(); onNext && onNext(); }}
           >
             Next Card →
           </button>
         ) : (
           <span className="px-6 py-2 text-[var(--color-primary)] font-bold text-sm tracking-widest uppercase flex items-center">
             Session Complete
           </span>
         )}
      </div>
    </div>
  );
}
