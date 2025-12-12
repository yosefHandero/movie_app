import { Movie, SavedMovie, TrendingMovie } from '@/interfaces/interfaces';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Web-compatible storage adapter
// Handles SSR by checking for window before accessing localStorage
const getStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web, but handle SSR case
    return {
      getItem: (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const item = window.localStorage.getItem(key);
            return Promise.resolve(item);
          }
        } catch (e) {
          // localStorage might be disabled or unavailable
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
        } catch (e) {
          // localStorage might be disabled or unavailable
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        } catch (e) {
          // localStorage might be disabled or unavailable
        }
        return Promise.resolve();
      },
    };
  } else {
    // Use AsyncStorage for native (lazy load to avoid SSR issues)
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage;
    } catch (e) {
      // Fallback if AsyncStorage is not available
      return {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
      };
    }
  }
};

// Get Supabase URL - check multiple possible env var names
// Note: In Expo, only EXPO_PUBLIC_ prefixed vars are available in client code
const projectId = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;
const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL || process.env.SUPABASE_PROJECT_URL;
const publicUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

let supabaseUrl: string;
// Priority: EXPO_PUBLIC_SUPABASE_URL (if not placeholder) > EXPO_PUBLIC_SUPABASE_PROJECT_URL > construct from PROJECT_ID
if (publicUrl && publicUrl !== 'https://your-project-id.supabase.co' && !publicUrl.includes('your-project-id')) {
  supabaseUrl = publicUrl;
} else if (projectUrl) {
  supabaseUrl = projectUrl;
} else if (projectId) {
  supabaseUrl = `https://${projectId}.supabase.co`;
} else {
  throw new Error(
    'Missing Supabase URL. Please add one of: ' +
    'EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PROJECT_URL, or EXPO_PUBLIC_SUPABASE_PROJECT_ID to .env.local. ' +
    'Note: Use EXPO_PUBLIC_ prefix for Expo to access variables in the app.'
  );
}

// Get Supabase Anon Key - check both EXPO_PUBLIC_ prefixed and non-prefixed versions
// Note: In Expo, EXPO_PUBLIC_ prefix is required for client-side access
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase Anon Key. Please add EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key to .env.local. ' +
    'Note: Use EXPO_PUBLIC_ prefix for Expo to access it in the app. ' +
    'Get it from: Supabase Dashboard → Settings → API → anon/public key'
  );
}

// Create Supabase client with platform-specific storage
// For web, use localStorage directly; for native, use AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', // Enable URL detection for web magic links
  },
});

// Auth Functions
export const getCurrentUser = async () => {
  try {
    // First try to get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }
    
    if (session?.user) {
      return session.user;
    }
    
    // Fallback to getUser if session doesn't have user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error: unknown) {
    // Don't log expected errors (no session, invalid token)
    const expectedErrors = [
      'Invalid Refresh Token: Refresh Token Not Found',
      'Auth session missing',
      'AuthSessionMissingError',
    ];
    
    const errorMessage = error instanceof Error ? error.message : '';
    const errorName = error instanceof Error ? error.name : '';
    
    const isExpectedError = expectedErrors.some(
      (expected) => errorMessage.includes(expected) || errorName.includes(expected)
    );
    
    if (!isExpectedError) {
      console.error('Get current user error:', error);
    }
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
};

export const sendMagicLink = async (email: string) => {
  try {
    // Get the current origin URL for redirect (works for both web and mobile)
    let redirectUrl: string | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Use current origin + /profile for web deployments
      redirectUrl = `${window.location.origin}/profile`;
    } else {
      // For mobile, use the app scheme or leave undefined
      redirectUrl = undefined;
    }

    // signInWithOtp sends OTP code if email template uses {{ .Token }}, or magic link if uses {{ .ConfirmationURL }}
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true, // Create user if doesn't exist
      },
    });
    if (error) throw error;
    const userId = (data?.user as { id?: string } | null)?.id || '';
    return { userId };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';
    console.error('Send OTP error:', errorMessage);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
};

export const loginWithOTP = async (email: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
    console.error('Login with OTP error:', errorMessage);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Database Functions
export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    // Check if search term exists
    const { data: existing, error: fetchError } = await supabase
      .from('search_queries')
      .select('*')
      .eq('search_term', query)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Update count
      const { error } = await supabase
        .from('search_queries')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert new search query
      const { error } = await supabase.from('search_queries').insert({
        search_term: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating search count:', error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const { data, error } = await supabase
      .from('search_queries')
      .select('*')
      .order('count', { ascending: false })
      .limit(5);

    if (error) throw error;

    return data?.map((item) => ({
      searchTerm: item.search_term,
      movie_id: item.movie_id,
      title: item.title,
      count: item.count,
      poster_url: item.poster_url,
    })) as TrendingMovie[];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return undefined;
  }
};

export const saveMovie = async (movie: {
  id: number;
  title: string;
  poster_path: string;
}) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('You must be logged in to save movies');
    }

    const poster_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    // Check if movie already saved
    const { data: existing, error: checkError } = await supabase
      .from('saved_movies')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movie.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      throw new Error('Movie already saved');
    }

    // Insert new saved movie
    const { error } = await supabase.from('saved_movies').insert({
      user_id: user.id,
      movie_id: movie.id,
      title: movie.title,
      poster_url,
    });

    if (error) throw error;
    console.log('Movie saved!');
  } catch (err: any) {
    console.error('Error saving movie:', err);
    throw err;
  }
};

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('User not logged in, returning empty saved movies');
      return [];
    }

    const { data, error } = await supabase
      .from('saved_movies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (
      data?.map((item) => ({
        $id: item.id,
        movie_id: item.movie_id,
        title: item.title,
        poster_url: item.poster_url,
        user_id: item.user_id,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching saved movies:', error);
    return [];
  }
};

export const deleteSavedMovie = async (documentId: string) => {
  try {
    const { error } = await supabase.from('saved_movies').delete().eq('id', documentId);
    if (error) throw error;
    console.log('Deleted saved movie:', documentId);
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
};

export const toggleSaveMovie = async (movie: {
  id: number;
  title: string;
  poster_path: string;
}): Promise<{ isSaved: boolean; error?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { isSaved: false, error: 'You must be logged in to save movies' };
    }

    const poster_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    // Check if movie already saved
    const { data: existing, error: checkError } = await supabase
      .from('saved_movies')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movie.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      // Movie is already saved, so unsave it
      const { error } = await supabase.from('saved_movies').delete().eq('id', existing.id);
      if (error) throw error;
      console.log('Movie unsaved:', movie.id);
      return { isSaved: false };
    } else {
      // Movie is not saved, so save it
      const { error } = await supabase.from('saved_movies').insert({
        user_id: user.id,
        movie_id: movie.id,
        title: movie.title,
        poster_url,
      });
      if (error) throw error;
      console.log('Movie saved:', movie.id);
      return { isSaved: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to toggle save status';
    console.error('Error toggling save movie:', errorMessage);
    return { isSaved: false, error: errorMessage };
  }
};

