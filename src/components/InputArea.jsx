import React, { useState, useRef } from 'react';
import { Upload, File, X, Sparkles } from 'lucide-react';

export default function InputArea({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;

    let fileData = null;
    if (file) {
      fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
          base64: reader.result.split(',')[1],
          mimeType: file.type
        });
        reader.readAsDataURL(file);
      });
    }

    onSubmit({ text, title, fileData });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="deck-title" className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-main)] opacity-60">
          Deck Title (Optional)
        </label>
        <input
          type="text"
          id="deck-title"
          className="w-full p-3 bg-transparent border-b-2 border-[var(--color-border-subtle)] focus:border-[var(--color-primary)] focus:outline-none transition-colors duration-300 font-medium"
          placeholder="Leave blank to auto-generate..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="lecture-input" className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-main)] opacity-60">
          Source Material (Text or File)
        </label>
        <textarea
          id="lecture-input"
          className="w-full h-40 p-4 bg-white/50 border-2 border-[var(--color-border-subtle)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none resize-none transition-all duration-300 text-lg leading-relaxed shadow-inner"
          placeholder="Paste your lecture text here, or upload a file below..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-main)] opacity-60">Attachments</label>
        <div 
          className={`border-2 border-dashed rounded-xl p-4 transition-all flex items-center justify-between ${file ? 'border-[var(--color-primary)] bg-[#fff5f5]' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]'}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2 rounded-md ${file ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 opacity-60'}`}>
              <File size={20} />
            </div>
            {file ? (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{file.name}</span>
                <span className="text-[10px] opacity-60 uppercase tracking-tighter">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <span className="text-sm opacity-50 italic">No file selected (PDF or Images)</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {file && (
              <button 
                onClick={() => setFile(null)}
                className="p-2 hover:bg-black/5 rounded-full text-red-600 transition-colors"
                title="Remove file"
              >
                <X size={18} />
              </button>
            )}
            <button 
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-white border-2 border-[var(--color-border-subtle)] rounded-lg text-xs font-bold uppercase tracking-wider hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex items-center gap-2 shadow-sm"
              disabled={isLoading}
            >
              <Upload size={14} />
              {file ? 'Replace' : 'Upload'}
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf,image/*"
            className="hidden"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || (!text.trim() && !file)}
        className="w-full py-4 bg-[var(--color-text-main)] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>AI Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Generate Study Package</span>
          </>
        )}
      </button>
    </div>
  );
}
