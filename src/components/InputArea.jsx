import React, { useState } from 'react';

export default function InputArea({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() === '') return;
    onSubmit({ text, customTitle: title });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="deck-title" className="text-sm font-semibold tracking-wider uppercase text-[var(--color-text-main)] opacity-80">
          Deck Title (Optional)
        </label>
        <input
          type="text"
          id="deck-title"
          className="w-full p-3 bg-transparent border-b-2 border-[var(--color-border-subtle)] focus:border-primary focus:outline-none transition-colors duration-300"
          placeholder="Leave blank to auto-generate..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="lecture-input" className="text-sm font-semibold tracking-wider uppercase text-[var(--color-text-main)] opacity-80">
          Lecture Notes
        </label>
        <textarea
          id="lecture-input"
        className="w-full h-48 p-4 bg-transparent border-b-2 border-[var(--color-border-subtle)] focus:border-primary focus:outline-none resize-none transition-colors duration-300"
        placeholder="Paste your lecture text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading || text.trim() === ''}
        className="self-end px-6 py-2 bg-[var(--color-primary)] text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Generating Deck...' : 'Generate 10-Card Deck'}
      </button>
    </div>
  );
}
