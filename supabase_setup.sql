-- ============================================
-- Supabase Database Setup for Movie App
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste this → Run

-- ============================================
-- 1. Create search_queries table (for trending movies)
-- ============================================
CREATE TABLE IF NOT EXISTS public.search_queries (
    id BIGSERIAL PRIMARY KEY,
    search_term TEXT NOT NULL,
    movie_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_search_queries_search_term ON public.search_queries(search_term);
CREATE INDEX IF NOT EXISTS idx_search_queries_count ON public.search_queries(count DESC);

-- ============================================
-- 2. Create saved_movies table (for user watchlists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_movies (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_movies_user_id ON public.saved_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_movies_movie_id ON public.saved_movies(movie_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_movies_user_movie ON public.saved_movies(user_id, movie_id);

-- ============================================
-- 3. Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on search_queries (public read, authenticated write)
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read search_queries"
    ON public.search_queries
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert search_queries"
    ON public.search_queries
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update search_queries"
    ON public.search_queries
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Enable RLS on saved_movies (users can only see their own)
ALTER TABLE public.saved_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved movies"
    ON public.saved_movies
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved movies"
    ON public.saved_movies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved movies"
    ON public.saved_movies
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 4. Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for search_queries
DROP TRIGGER IF EXISTS update_search_queries_updated_at ON public.search_queries;
CREATE TRIGGER update_search_queries_updated_at
    BEFORE UPDATE ON public.search_queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Done! Your tables are now set up.
-- ============================================
