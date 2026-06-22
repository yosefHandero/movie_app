import { CategoryPillsLoop } from "@/components/CategoryPillsLoop";
import { GradientBackground } from "@/components/GradientBackground";
import { Header } from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Genre } from "@/interfaces/interfaces";
import { fetchGenres, fetchMovies, fetchMoviesByGenre } from "@/services/api";
import { updateSearchCount } from "@/services/backend";
import useFetch from "@/services/useFetch";
import { getFunGenreLabel } from "@/utils/movieInsights";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;
const isSmallPhone = SCREEN_WIDTH < 400;

const getCardWidth = () => {
  if (isDesktop) return "22%";
  if (isTablet) return "30%";
  if (isSmallPhone) return "100%";
  return "47%";
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenreObj, setSelectedGenreObj] = useState<Genre | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const countedQueries = useRef<Set<string>>(new Set());

  const fetchGenresCallback = useCallback(() => fetchGenres(), []);
  const { data: genres = [], loading: genresLoading } =
    useFetch(fetchGenresCallback);

  const fetchMoviesCallback = useCallback(() => {
    if (searchQuery.trim()) {
      return fetchMovies({ query: searchQuery });
    }
    return Promise.resolve([]);
  }, [searchQuery]);

  const fetchGenreMoviesCallback = useCallback(() => {
    if (!selectedGenreObj) return Promise.resolve([]);
    return fetchMoviesByGenre(selectedGenreObj.id, 1);
  }, [selectedGenreObj]);

  const {
    data: genreMovies = [],
    loading: genreMoviesLoading,
    refetch: refetchGenreMovies,
  } = useFetch(fetchGenreMoviesCallback);

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
  } = useFetch(fetchMoviesCallback);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        loadMovies().catch(() => {});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, loadMovies]);

  useEffect(() => {
    if (
      searchQuery.trim() &&
      movies.length > 0 &&
      !countedQueries.current.has(searchQuery)
    ) {
      countedQueries.current.add(searchQuery);
      updateSearchCount(searchQuery, movies[0]).catch(() => {});
    }
  }, [searchQuery, movies]);

  const handleGenreSelect = (genre: Genre) => {
    if (selectedGenreObj?.id === genre.id) {
      setSelectedGenreObj(null);
    } else {
      setSelectedGenreObj(genre);
      setSearchQuery("");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadMovies(), refetchGenreMovies()]);
    } catch {
      // ignore refresh errors
    } finally {
      setRefreshing(false);
    }
  }, [loadMovies, refetchGenreMovies]);

  const cardWidth = getCardWidth();
  const useSingleColumn = isSmallPhone;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={["top"]}>
      <GradientBackground />
      <View className="flex-1">
        <Header />

        <View className="px-4 sm:px-6 mb-4 items-center">
          <View className="w-full max-w-sm">
            <SearchBar
              placeholder="Search for a movie..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  setSelectedGenreObj(null);
                }
              }}
              autoFocus
            />
          </View>
        </View>

        <View className="mb-4">
          <View className="px-4 sm:px-6 mb-3">
            <Text className="text-text-primary text-xl font-bold">
              Browse by Category
            </Text>
          </View>
          <CategoryPillsLoop
            genres={genres}
            loading={genresLoading}
            onGenrePress={handleGenreSelect}
            selectedGenreId={selectedGenreObj?.id || null}
          />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {selectedGenreObj && !searchQuery.trim() && (
            <View className="px-4 sm:px-6 mb-6">
              <View className="mb-4">
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  {getFunGenreLabel(selectedGenreObj.name).label} Movies
                </Text>
                <Text className="text-text-secondary text-sm">
                  {genreMovies.length}{" "}
                  {genreMovies.length === 1 ? "movie" : "movies"} found
                </Text>
              </View>

              {genreMoviesLoading ? (
                <View className="flex-row flex-wrap gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                      key={i}
                      width={cardWidth}
                      height={280}
                      borderRadius={12}
                    />
                  ))}
                </View>
              ) : genreMovies.length === 0 ? (
                <EmptyState
                  title="No movies found"
                  message={`We couldn't find any ${selectedGenreObj.name.toLowerCase()} movies`}
                />
              ) : (
                <View
                  className={
                    useSingleColumn ? "gap-4" : "flex-row flex-wrap gap-3"
                  }
                >
                  {genreMovies.map((item) => (
                    <View
                      key={item.id}
                      style={{ width: useSingleColumn ? "100%" : cardWidth }}
                    >
                      <MovieCard
                        {...item}
                        size={useSingleColumn ? "large" : "small"}
                        showRating
                        showInsights
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {!selectedGenreObj && (
            <>
              {loading && searchQuery.trim() ? (
                <View className="px-4 sm:px-6">
                  <View className="flex-row flex-wrap gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        width={cardWidth}
                        height={280}
                        borderRadius={12}
                      />
                    ))}
                  </View>
                </View>
              ) : error ? (
                <View className="px-4 sm:px-6 py-12">
                  <EmptyState
                    title="Search Error"
                    message="Network error: Unable to reach server."
                  />
                </View>
              ) : searchQuery.trim() && movies.length === 0 && !loading ? (
                <EmptyState
                  title="No movies found"
                  message={`We couldn't find any movies matching "${searchQuery}"`}
                />
              ) : !searchQuery.trim() ? (
                <View className="px-4 sm:px-6 py-12">
                  <EmptyState
                    title="Start exploring"
                    message="Search for movies or select a category to discover films"
                  />
                </View>
              ) : movies.length > 0 ? (
                <View className="px-4 sm:px-6 pb-8">
                  <View className="mb-6">
                    <Text className="text-text-primary text-2xl font-bold mb-2">
                      Search Results
                    </Text>
                    <Text className="text-text-secondary text-base">
                      Found{" "}
                      <Text className="text-accent-primary font-bold">
                        {movies.length}
                      </Text>{" "}
                      {movies.length === 1 ? "movie" : "movies"} for{" "}
                      <Text className="text-accent-primary font-semibold">
                        {searchQuery}
                      </Text>
                    </Text>
                  </View>
                  <View
                    className={
                      useSingleColumn ? "gap-4" : "flex-row flex-wrap gap-3"
                    }
                  >
                    {movies.map((item) => (
                      <View
                        key={item.id}
                        style={{ width: useSingleColumn ? "100%" : cardWidth }}
                      >
                        <MovieCard
                          {...item}
                          size={useSingleColumn ? "large" : "small"}
                          showRating
                          showInsights
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Search;
