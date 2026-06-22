import { Movie, TrendingMovie } from '@/interfaces/interfaces';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

const isNetworkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Failed to fetch') ||
    message.includes('Network request failed') ||
    message.includes('fetch')
  );
};

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    await apiFetch('/api/trending/track', {
      method: 'POST',
      body: JSON.stringify({ query, movie }),
    });
  } catch (error) {
    if (!isNetworkError(error)) {
      console.error('Error updating search count:', error);
    }
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const data = await apiFetch<{ trending: TrendingMovie[] }>(
      '/api/trending',
      { method: 'GET' }
    );
    return data.trending;
  } catch (error) {
    if (!isNetworkError(error)) {
      console.error('Error fetching trending movies:', error);
    }
    return undefined;
  }
};
