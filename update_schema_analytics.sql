-- Add total_questions_attempted to user_stats table
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS total_questions_attempted INTEGER DEFAULT 0;

-- Initialize it for existing data to avoid division by zero (default to 10 per quiz taken)
UPDATE public.user_stats SET total_questions_attempted = total_quizzes_taken * 10 WHERE total_questions_attempted IS NULL OR total_questions_attempted = 0;
