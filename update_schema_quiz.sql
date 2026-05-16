-- Update the decks table to include quiz data and high scores
ALTER TABLE public.decks 
ADD COLUMN IF NOT EXISTS quiz JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS high_score INTEGER DEFAULT 0;
