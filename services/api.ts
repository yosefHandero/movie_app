import { Movie, MovieDetails, WatchProvidersResult } from "@/interfaces/interfaces";

// Validate API key on module load
const getApiKey = () => {
    const apiKey = process.env.EXPO_PUBLIC_MOVIE_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        console.error('⚠️ TMDB API Key is missing! Please add EXPO_PUBLIC_MOVIE_API_KEY to .env.local');
        throw new Error('TMDB API key is not configured. Please check your .env.local file.');
    }
    return apiKey;
};

const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    get API_KEY() {
        return getApiKey();
    },
    headers: {
        accept: "application/json",
    },
};

// Helper function to build URL with API key
const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
    // Ensure endpoint starts with / and base URL doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = TMDB_CONFIG.BASE_URL.endsWith('/') 
        ? TMDB_CONFIG.BASE_URL.slice(0, -1) 
        : TMDB_CONFIG.BASE_URL;
    
    const url = new URL(`${baseUrl}${cleanEndpoint}`);
    url.searchParams.set('api_key', TMDB_CONFIG.API_KEY);
    
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
        });
    }
    
    return url.toString();
};

// Enhanced error handling with retry logic and timeout
const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    retries = 2,
    timeout = 10000 // 10 second timeout
): Promise<Response> => {
    try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    ...TMDB_CONFIG.headers,
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Handle specific error codes
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your EXPO_PUBLIC_MOVIE_API_KEY in .env.local');
                }
                if (response.status === 429) {
                    if (retries > 0) {
                        // Rate limited - wait and retry with exponential backoff
                        const delay = Math.min(1000 * Math.pow(2, 2 - retries), 5000);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchWithRetry(url, options, retries - 1, timeout);
                    }
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                if (response.status >= 500 && retries > 0) {
                    // Server error - retry with exponential backoff
                    const delay = Math.min(500 * Math.pow(2, 2 - retries), 2000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithRetry(url, options, retries - 1, timeout);
                }
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return response;
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            // Handle abort (timeout)
            if (fetchError.name === 'AbortError') {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return fetchWithRetry(url, options, retries - 1, timeout);
                }
                throw new Error('Request timeout. Please check your connection and try again.');
            }
            throw fetchError;
        }
    } catch (error: any) {
        if (error.message.includes('API key') || error.message.includes('401')) {
            throw error;
        }
        if (retries > 0 && !error.message.includes('fetch') && !error.message.includes('timeout')) {
            const delay = Math.min(500 * Math.pow(2, 2 - retries), 2000);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, timeout);
        }
        throw new Error(`Network error: ${error.message}`);
    }
};

export const fetchMovies = async ({
    query,
}: {
    query: string;
}): Promise<Movie[]> => {
    try {
        const endpoint = query
            ? buildUrl('/search/movie', { query })
            : buildUrl('/discover/movie', { sort_by: 'popularity.desc' });

        const response = await fetchWithRetry(endpoint);
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
            console.warn('Unexpected API response format:', data);
            return [];
        }
        
        return data.results;
    } catch (error: any) {
        console.error("Fetch Movies Error:", error);
        // Return empty array instead of throwing to prevent app crash
        return [];
    }
};

export const fetchMovieDetails = async (
    movieId: string
): Promise<MovieDetails | null> => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            throw new Error('Invalid movie ID');
        }

        const url = buildUrl(`/movie/${movieId}`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return data;
    } catch (error: any) {
        console.error("Error fetching movie details:", error);
        return null;
    }
};

// Fetch similar movies
export const fetchSimilarMovies = async (movieId: string): Promise<Movie[]> => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            return [];
        }

        const url = buildUrl(`/movie/${movieId}/similar`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return data.results || [];
    } catch (error) {
        console.error("Error fetching similar movies:", error);
        return [];
    }
};

// Fetch movie credits (cast & crew)
export const fetchMovieCredits = async (movieId: string) => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            return { cast: [], crew: [] };
        }

        const url = buildUrl(`/movie/${movieId}/credits`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return {
            cast: data.cast || [],
            crew: data.crew || [],
        };
    } catch (error) {
        console.error("Error fetching movie credits:", error);
        return { cast: [], crew: [] };
    }
};

// Fetch movie videos (trailers)
export const fetchMovieVideos = async (movieId: string) => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            return [];
        }

        const url = buildUrl(`/movie/${movieId}/videos`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        // Filter for trailers and teasers, prefer YouTube
        const trailers = (data.results || []).filter(
            (video: any) => 
                (video.type === 'Trailer' || video.type === 'Teaser') && 
                video.site === 'YouTube'
        );
        return trailers;
    } catch (error) {
        console.error("Error fetching movie videos:", error);
        return [];
    }
};

// Fetch movie genres list
export const fetchGenres = async () => {
    try {
        const url = buildUrl('/genre/movie/list');
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return data.genres || [];
    } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
};

// Generic function to fetch movie lists (consolidates duplicate code)
const fetchMovieList = async (endpoint: string, page: number = 1): Promise<Movie[]> => {
    try {
        const url = buildUrl(endpoint, { page });
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
};

// Fetch top rated movies
export const fetchTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
    return fetchMovieList('/movie/top_rated', page);
};

// Fetch now playing movies
export const fetchNowPlayingMovies = async (page: number = 1): Promise<Movie[]> => {
    return fetchMovieList('/movie/now_playing', page);
};

// Fetch upcoming movies
export const fetchUpcomingMovies = async (page: number = 1): Promise<Movie[]> => {
    return fetchMovieList('/movie/upcoming', page);
};

// Fetch popular movies
export const fetchPopularMovies = async (page: number = 1): Promise<Movie[]> => {
    return fetchMovieList('/movie/popular', page);
};

// Discover movies with filters
const discoverMovies = async (filters: {
    genreIds?: number[];
    year?: number;
    sortBy?: string;
    voteAverage?: number;
    page?: number;
}): Promise<Movie[]> => {
    try {
        const params: Record<string, string | number> = {
            sort_by: filters.sortBy || 'popularity.desc',
            page: filters.page || 1,
        };

        if (filters.genreIds && filters.genreIds.length > 0) {
            params.with_genres = filters.genreIds.join(',');
        }

        if (filters.year) {
            params.primary_release_year = filters.year;
        }

        if (filters.voteAverage) {
            params['vote_average.gte'] = filters.voteAverage;
        }

        const url = buildUrl('/discover/movie', params);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return data.results || [];
    } catch (error) {
        console.error("Error discovering movies:", error);
        return [];
    }
};

// Fetch movies by genre
export const fetchMoviesByGenre = async (genreId: number, page: number = 1): Promise<Movie[]> => {
    return discoverMovies({ genreIds: [genreId], page });
};

// Fetch A-List movies (high-rated blockbusters)
export const fetchAListMovies = async (page: number = 1): Promise<Movie[]> => {
    return discoverMovies({
        voteAverage: 7.5,
        sortBy: 'popularity.desc',
        page,
    });
};

// Fetch movie collection
export const fetchCollection = async (collectionId: number) => {
    try {
        if (!collectionId || isNaN(Number(collectionId))) {
            return null;
        }

        const url = buildUrl(`/collection/${collectionId}`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error("Error fetching collection:", error);
        return null;
    }
};

// Fetch watch providers for a region (official TMDB data only)
export const fetchWatchProviders = async (
    movieId: string,
    region: string = "US"
): Promise<WatchProvidersResult | null> => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            return null;
        }

        const url = buildUrl(`/movie/${movieId}/watch/providers`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        const regionData = data?.results?.[region];

        if (!regionData) {
            return { flatrate: [], rent: [], buy: [], link: null };
        }

        const mapProviders = (list: any[] = []) =>
            list.map((p) => ({
                provider_id: p.provider_id,
                provider_name: p.provider_name,
                logo_path: p.logo_path ?? null,
            }));

        return {
            flatrate: mapProviders(regionData.flatrate),
            rent: mapProviders(regionData.rent),
            buy: mapProviders(regionData.buy),
            link: regionData.link ?? null,
        };
    } catch (error) {
        console.error("Error fetching watch providers:", error);
        return null;
    }
};

// Fetch US certification from release dates
export const fetchMovieCertification = async (
    movieId: string,
    region: string = "US"
): Promise<string | null> => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            return null;
        }

        const url = buildUrl(`/movie/${movieId}/release_dates`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        const regionEntry = (data?.results || []).find(
            (r: { iso_3166_1: string }) => r.iso_3166_1 === region
        );

        if (!regionEntry?.release_dates?.length) {
            return null;
        }

        const theatrical = regionEntry.release_dates.find(
            (d: { type: number; certification?: string }) =>
                d.type === 3 && d.certification
        );
        const withCert = regionEntry.release_dates.find(
            (d: { certification?: string }) => d.certification
        );

        return theatrical?.certification || withCert?.certification || null;
    } catch (error) {
        console.error("Error fetching movie certification:", error);
        return null;
    }
};

// Fetch movie keywords (for mature-content and vibe signals)
export const fetchMovieKeywords = async (
    movieId: string
): Promise<string[]> => {
    try {
        if (!movieId || isNaN(Number(movieId))) {
            return [];
        }

        const url = buildUrl(`/movie/${movieId}/keywords`);
        const response = await fetchWithRetry(url);
        const data = await response.json();
        const keywords = data?.keywords || [];

        return keywords
            .map((k: { name?: string }) => k.name?.toLowerCase().trim())
            .filter(Boolean) as string[];
    } catch (error) {
        console.error("Error fetching movie keywords:", error);
        return [];
    }
};