-- Create user_stats table
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  total_quizzes_taken INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  last_deck_title TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create completion_history table to track names of all decks ever finished
CREATE TABLE public.completion_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  deck_title TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own stats" ON public.user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own history" ON public.completion_history FOR ALL USING (auth.uid() = user_id);
