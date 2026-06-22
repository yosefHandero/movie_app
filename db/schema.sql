-- Neon Postgres schema for Movie App (run once via Vercel Neon Query or psql)

CREATE TABLE IF NOT EXISTS search_queries (
    id BIGSERIAL PRIMARY KEY,
    search_term TEXT NOT NULL,
    movie_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    poster_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_term ON search_queries (search_term);
CREATE INDEX IF NOT EXISTS idx_search_queries_count ON search_queries (count DESC);
