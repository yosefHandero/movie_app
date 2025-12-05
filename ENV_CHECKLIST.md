# Environment Setup Checklist

## ✅ Required Environment Variables

Your `.env.local` file **MUST** contain these variables:

```bash
# TMDB API Key (Required for movie data)
EXPO_PUBLIC_MOVIE_API_KEY=your_tmdb_api_key_here

# Supabase URL (Required - use ONE of these)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# OR
# EXPO_PUBLIC_SUPABASE_PROJECT_URL=https://your-project-id.supabase.co
# OR
# EXPO_PUBLIC_SUPABASE_PROJECT_ID=your-project-id

# Supabase Anon Key (Required)
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🔧 Setup Steps

### Step 1: Fix TMDB API Key (401 Error)

1. Go to https://www.themoviedb.org/
2. Sign up/Login
3. Go to **Settings → API**
4. Request an API key (v3 auth)
5. Copy your API key
6. Add to `.env.local`:
   ```bash
   EXPO_PUBLIC_MOVIE_API_KEY=paste_your_key_here
   ```

### Step 2: Fix Supabase Tables (404 Error)

The app needs two tables in your Supabase database:

1. **Open Supabase Dashboard** → Your Project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase_setup.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify tables were created:
   - Go to **Table Editor**
   - You should see:
     - `search_queries` table
     - `saved_movies` table

### Step 3: Verify Environment Variables

Check your `.env.local` file:

- ✅ `EXPO_PUBLIC_MOVIE_API_KEY` is set and not empty
- ✅ `EXPO_PUBLIC_SUPABASE_URL` (or PROJECT_URL/PROJECT_ID) is set
- ✅ `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set and not empty
- ✅ All variables start with `EXPO_PUBLIC_` prefix
- ✅ No quotes around values (unless needed)
- ✅ No extra spaces

### Step 4: Restart Expo

After making changes:

```bash
# Stop the current server (Ctrl+C)
# Then restart with cache clear:
npx expo start --clear
```

## 🧪 Test Your Setup

1. **Test TMDB**: Browse movies on home screen
2. **Test Supabase**:
   - Try searching for a movie (tests `search_queries`)
   - Try logging in (tests auth)
   - Try saving a movie (tests `saved_movies`)

## ❌ Common Issues

### "401 Unauthorized" from TMDB

- API key is missing or invalid
- Check `.env.local` has `EXPO_PUBLIC_MOVIE_API_KEY`
- Restart Expo after adding

### "404 Not Found" or "table not found" from Supabase

- Tables haven't been created
- Run the SQL from `supabase_setup.sql` in Supabase SQL Editor
- Check table names match exactly: `search_queries` and `saved_movies`

### Variables not loading

- Must use `EXPO_PUBLIC_` prefix
- Restart Expo with `--clear` flag
- Check file is named `.env.local` (not `.env`)

## 📋 Quick Reference

**Required Tables:**

- `search_queries` - Tracks search terms for trending movies
- `saved_movies` - User watchlists

**Required Env Vars:**

- `EXPO_PUBLIC_MOVIE_API_KEY` - TMDB API key
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
