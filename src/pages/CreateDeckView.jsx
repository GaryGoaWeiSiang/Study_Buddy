import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputArea from '../components/InputArea';
import { generateFlashcards } from '../services/gemini';
import { supabase } from '../services/supabase';

export default function CreateDeckView({ setDecks, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async ({ text, title, fileData }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFlashcards({ text, fileData });
      
      const newDeck = {
        user_id: userId,
        title: title && title.trim() !== '' ? title : result.title,
        cards: result.cards,
        quiz: result.quiz,
        current_index: 0
      };

      const { data, error: dbError } = await supabase.from('decks').insert([newDeck]).select().single();
      if (dbError) throw dbError;

      setDecks((prevDecks) => [data, ...prevDecks]);
      navigate(`/study/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full flex flex-col gap-6">
      <h2 className="text-3xl font-bold tracking-tight">Generate Study Package</h2>
      <p className="opacity-70 text-lg">Input your lecture notes, PDFs, or images of handwritten notes to generate your AI deck.</p>
      
      <div className="bento-card mt-4">
        {error && (
          <div className="mb-6 p-4 bg-[#ffdad6] text-[#93000a] rounded-md text-sm border border-[#ba1a1a]">
            {error}
          </div>
        )}
        <InputArea onSubmit={handleGenerate} isLoading={isLoading} />
      </div>
    </div>
  );
}
