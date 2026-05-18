import React, { useState, useRef } from 'react';
import { Upload, File, X, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

export default function InputArea({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const isAccepted = droppedFile.type === 'application/pdf' || 
                         droppedFile.type.startsWith('image/') || 
                         droppedFile.name.endsWith('.pptx') || 
                         droppedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      
      if (isAccepted) {
        setFile(droppedFile);
      } else {
        alert("Please drop a valid PDF, PPTX, or Image file.");
      }
    }
  };

  const extractPptxText = async (pptxFile) => {
    try {
      const zip = await JSZip.loadAsync(pptxFile);
      const slideFiles = Object.keys(zip.files).filter(
        path => path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
      );
      
      // Sort slides numerically
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

      const slideTexts = [];
      const parser = new DOMParser();

      for (const filePath of slideFiles) {
        const xmlText = await zip.files[filePath].async('text');
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const textNodes = xmlDoc.getElementsByTagName('a:t');
        const slideText = Array.from(textNodes)
          .map(node => node.textContent)
          .filter(t => t.trim().length > 0)
          .join(' ');
        
        slideTexts.push(slideText);
      }

      return slideTexts
        .map((slideText, idx) => `[Slide ${idx + 1}]\n${slideText}`)
        .join('\n\n');
    } catch (err) {
      console.error("Failed to parse PPTX:", err);
      throw new Error("Could not extract text from PowerPoint file. Please ensure it is not corrupt.");
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;

    let fileData = null;
    let finalPayloadText = text;

    if (file) {
      const isPptx = file.name.endsWith('.pptx') || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      
      if (isPptx) {
        try {
          const extractedText = await extractPptxText(file);
          finalPayloadText = finalPayloadText 
            ? `${finalPayloadText}\n\n[Extracted Slide Content]\n${extractedText}`
            : extractedText;
        } catch (err) {
          alert(err.message);
          return;
        }
      } else {
        // PDF or Image base64 upload
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({
            base64: reader.result.split(',')[1],
            mimeType: file.type
          });
          reader.readAsDataURL(file);
        });
      }
    }

    onSubmit({ text: finalPayloadText, title, fileData });
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

      <div className="flex flex-col gap-2 animate-fadeIn">
        <label className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-main)] opacity-60">Attachments</label>
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDragging 
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.01]' 
              : file 
                ? 'border-[var(--color-primary)] bg-[#fff5f5]' 
                : 'border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] bg-white/20'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden w-full md:w-auto">
            <div className={`p-3 rounded-xl transition-all ${file ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 opacity-60 text-gray-500'}`}>
              <File size={24} />
            </div>
            {file ? (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate text-[var(--color-text-main)]">{file.name}</span>
                <span className="text-[10px] opacity-60 uppercase tracking-tighter">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--color-text-main)] opacity-70">
                  {isDragging ? 'Drop it here!' : 'Drag & drop your file here'}
                </span>
                <span className="text-[10px] opacity-50 font-medium">Supports PDF, PPTX, or Images</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
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
              className="px-4 py-2 bg-white border-2 border-[var(--color-border-subtle)] rounded-lg text-xs font-bold uppercase tracking-wider hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
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
            accept="application/pdf,image/*,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
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
