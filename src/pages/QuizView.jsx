import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CheckCircle2, XCircle, ChevronRight, Award, RotateCcw } from 'lucide-react';

export default function QuizView({ decks, setDecks, setStats }) {
  const { deckId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const activeDeck = decks.find(d => d.id === deckId);

  if (!activeDeck || !activeDeck.quiz) {
    return (
      <div className="max-w-3xl w-full flex flex-col items-center justify-center h-full opacity-50 min-h-[500px]">
        <p className="text-xl">Quiz not found for this deck.</p>
        <Link to="/" className="text-sm mt-2 text-[var(--color-primary)] hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const currentQuestion = activeDeck.quiz[currentQuestionIndex];

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < activeDeck.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      
      // Update Persistent Stats
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Fetch current stats to increment correctly
        const { data: currentStats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
        
        const updatedTaken = (currentStats?.total_quizzes_taken || 0) + 1;
        const updatedCorrect = (currentStats?.total_correct_answers || 0) + score;

        await supabase.from('user_stats').upsert({
          user_id: user.id,
          total_quizzes_taken: updatedTaken,
          total_correct_answers: updatedCorrect,
          updated_at: new Date().toISOString()
        });

        setStats(prev => ({
          ...prev,
          total_quizzes_taken: updatedTaken,
          total_correct_answers: updatedCorrect
        }));
      } catch (err) {
        console.error("Error updating quiz stats:", err);
      }

      // Sync high score to Supabase...
        try {
          await supabase.from('decks').update({ high_score: score }).eq('id', deckId);
          setDecks(prev => prev.map(d => d.id === deckId ? { ...d, high_score: score } : d));
        } catch (err) {
          console.error("Failed to sync high score:", err);
        }
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="max-w-2xl w-full mx-auto flex flex-col items-center justify-center py-12 gap-8 text-center">
        <div className="bento-card p-12 w-full flex flex-col items-center gap-6 shadow-xl">
          <div className="w-24 h-24 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-lg">
            <Award size={48} />
          </div>
          <div>
            <h2 className="text-4xl font-bold tracking-tight">Quiz Complete!</h2>
            <p className="opacity-70 mt-2 text-lg">Great work on finishing the session.</p>
          </div>
          
          <div className="flex gap-12 my-4">
            <div className="flex flex-col">
              <span className="text-4xl font-black text-[var(--color-primary)]">{score} / {activeDeck.quiz.length}</span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-60">Your Score</span>
            </div>
            <div className="flex flex-col border-l border-[var(--color-border-subtle)] pl-12">
              <span className="text-4xl font-black">{Math.round((score / activeDeck.quiz.length) * 100)}%</span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-60">Accuracy</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3 mt-4">
            <button 
              onClick={resetQuiz}
              className="w-full py-4 bg-[var(--color-primary)] text-white rounded-md font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
            <Link 
              to="/"
              className="w-full py-4 border-2 border-[var(--color-border-subtle)] rounded-md font-bold text-lg hover:bg-[var(--color-border-subtle)] transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-8 h-full">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest font-bold text-[var(--color-primary)]">Quiz Mode</span>
          <h2 className="text-3xl font-bold tracking-tight">{activeDeck.title}</h2>
        </div>
        <span className="text-sm font-bold opacity-60">Question {currentQuestionIndex + 1} of {activeDeck.quiz.length}</span>
      </div>

      <div className="w-full h-2 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
          style={{ width: `${((currentQuestionIndex + 1) / activeDeck.quiz.length) * 100}%` }}
        />
      </div>

      <div className="bento-card p-8 md:p-10 flex flex-col gap-8 shadow-sm">
        <h3 className="text-2xl font-medium leading-tight">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, index) => {
            let style = "border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] hover:bg-[#faf9f5]";
            let icon = null;

            if (isAnswered) {
              if (index === currentQuestion.correctAnswer) {
                style = "bg-[#d1e7dd] border-[#198754] text-[#0f5132]";
                icon = <CheckCircle2 size={20} className="text-[#198754]" />;
              } else if (index === selectedOption) {
                style = "bg-[#f8d7da] border-[#dc3545] text-[#842029]";
                icon = <XCircle size={20} className="text-[#dc3545]" />;
              } else {
                style = "opacity-50 border-[var(--color-border-subtle)]";
              }
            } else if (selectedOption === index) {
              style = "border-[var(--color-primary)] bg-[#faf9f5]";
            }

            return (
              <button
                key={index}
                disabled={isAnswered}
                onClick={() => handleOptionClick(index)}
                className={`w-full p-5 text-left border-2 rounded-xl transition-all duration-200 flex justify-between items-center group ${style}`}
              >
                <span className="font-medium text-lg">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <button 
            onClick={handleNext}
            className="mt-4 py-4 bg-[var(--color-text-main)] text-white rounded-md font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
          >
            {currentQuestionIndex < activeDeck.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
