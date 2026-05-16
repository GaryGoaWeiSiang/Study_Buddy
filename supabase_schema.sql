-- Create the decks table
CREATE TABLE public.decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  cards JSONB NOT NULL,
  current_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

-- Allow users to only select/insert/update/delete their OWN decks
CREATE POLICY "Users can manage their own decks"
  ON public.decks
  FOR ALL
  USING (auth.uid() = user_id);
