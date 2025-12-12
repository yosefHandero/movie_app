import { CategoryPillsLoop } from "@/components/CategoryPillsLoop";
import { GradientBackground } from "@/components/GradientBackground";
import { Header } from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Genre } from "@/interfaces/interfaces";
import {
  discoverMovies,
  fetchAListMovies,
  fetchGenres,
  fetchMovies,
  fetchMoviesByGenre,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "@/services/api";
import { updateSearchCount } from "@/services/supabase";
import useFetch from "@/services/useFetch";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;

const Search = () => {
  const params = useLocalSearchParams();
  const filterParam = params.filter as string | undefined;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    filterParam || null
  );
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedGenreObj, setSelectedGenreObj] = useState<Genre | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const countedQueries = useRef<Set<string>>(new Set());

  // Fetch genres for filter
  const fetchGenresCallback = useCallback(() => fetchGenres(), []);
  const { data: genres = [], loading: genresLoading } =
    useFetch(fetchGenresCallback);

  // Determine which API to call based on filter
  const fetchMoviesCallback = useCallback(() => {
    if (selectedFilter === "top-rated") {
      return fetchTopRatedMovies(1);
    } else if (selectedFilter === "now-playing") {
      return fetchNowPlayingMovies(1);
    } else if (selectedFilter === "upcoming") {
      return fetchUpcomingMovies(1);
    } else if (selectedFilter === "popular") {
      return fetchPopularMovies(1);
    } else if (selectedFilter === "a-list") {
      return fetchAListMovies(1);
    } else if (selectedGenre || selectedYear) {
      return discoverMovies({
        genreIds: selectedGenre ? [selectedGenre] : undefined,
        year: selectedYear || undefined,
        sortBy: "popularity.desc",
      });
    } else if (searchQuery.trim()) {
      return fetchMovies({ query: searchQuery });
    } else {
      return Promise.resolve([]);
    }
  }, [searchQuery, selectedFilter, selectedGenre, selectedYear]);

  // Fetch movies when genre is selected from categories
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
    if (filterParam) {
      setSelectedFilter(filterParam);
      setSearchQuery("");
    }
  }, [filterParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        searchQuery.trim() ||
        selectedFilter ||
        selectedGenre ||
        selectedYear
      ) {
        loadMovies().catch((err) => {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load movies";
          console.error("Error loading movies:", errorMessage);
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilter, selectedGenre, selectedYear, loadMovies]);

  useEffect(() => {
    if (
      searchQuery.trim() &&
      movies.length > 0 &&
      !countedQueries.current.has(searchQuery)
    ) {
      countedQueries.current.add(searchQuery);
      updateSearchCount(searchQuery, movies[0]).catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "";
        if (!/Rate limit/.test(errorMessage)) {
          console.error("Failed to update search count:", errorMessage);
        }
      });
    }
  }, [searchQuery, movies]);

  const getFilterTitle = () => {
    if (selectedFilter === "top-rated") return "Top Rated Movies";
    if (selectedFilter === "now-playing") return "Now Playing";
    if (selectedFilter === "upcoming") return "Coming Soon";
    if (selectedFilter === "popular") return "Popular Movies";
    if (selectedFilter === "a-list") return "A-List Watchlist";
    if (selectedGenre) {
      const genre = genres.find((g: Genre) => g.id === selectedGenre);
      return genre ? `${genre.name} Movies` : "Movies";
    }
    if (selectedYear) return `Movies from ${selectedYear}`;
    if (searchQuery.trim()) return "Search Results";
    return "Browse Movies";
  };

  const clearFilters = () => {
    setSelectedFilter(null);
    setSelectedGenre(null);
    setSelectedGenreObj(null);
    setSelectedYear(null);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedFilter || selectedGenre || selectedYear || selectedGenreObj;

  const handleGenreSelect = (genre: Genre) => {
    if (selectedGenreObj?.id === genre.id) {
      setSelectedGenreObj(null);
      setSelectedGenre(null);
    } else {
      setSelectedGenreObj(genre);
      setSelectedGenre(genre.id);
      setSelectedFilter(null);
      setSearchQuery("");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadMovies(), refetchGenreMovies()]);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadMovies, refetchGenreMovies]);

  const dataToRender = movies;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  // Generate years (last 30 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <GradientBackground />
      <View className="flex-1">
        {/* Header */}
        <Header />

        {/* Search Bar - Centered and Shorter */}
        <View className="px-6 mb-4 items-center">
          <View className="w-full max-w-sm">
            <SearchBar
              placeholder="Search for a movie..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  setSelectedFilter(null);
                  setSelectedGenre(null);
                  setSelectedGenreObj(null);
                  setSelectedYear(null);
                }
              }}
              autoFocus={!filterParam}
            />
          </View>
        </View>

        {/* Categories/Genres Section */}
        <View className="mb-4">
          <View className="px-6 mb-3">
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

        {/* Filter Chips */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center gap-3 flex-wrap">
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="px-4 py-2 rounded-full bg-bg-elevated border border-border-primary"
            >
              <Text className="text-text-primary text-sm font-semibold">
                Filters
              </Text>
            </TouchableOpacity>

            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearFilters}
                className="px-4 py-2 rounded-full bg-accent-primary"
              >
                <Text className="text-white text-sm font-semibold">
                  Clear All
                </Text>
              </TouchableOpacity>
            )}

            {selectedFilter && (
              <View className="px-4 py-2 rounded-full bg-accent-primary/20 border border-accent-primary/30">
                <Text className="text-accent-primary text-sm font-semibold">
                  {getFilterTitle()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {/* Show genre movies if genre is selected */}
          {selectedGenreObj && !searchQuery.trim() && !selectedFilter && (
            <View className="px-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-text-primary text-2xl font-bold mb-1">
                    {selectedGenreObj.name} Movies
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {genreMovies.length}{" "}
                    {genreMovies.length === 1 ? "movie" : "movies"} found
                  </Text>
                </View>
              </View>

              {genreMoviesLoading ? (
                <View className="flex-row flex-wrap gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      width={isDesktop ? "22%" : isTablet ? "30%" : "45%"}
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
                <View className="flex-row flex-wrap gap-4">
                  {genreMovies.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        width: isDesktop ? "22%" : isTablet ? "30%" : "45%",
                      }}
                    >
                      <MovieCard
                        {...item}
                        size={isDesktop ? "medium" : "small"}
                        showRating={true}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Show search/filter results */}
          {!selectedGenreObj && (
            <>
              {loading && (searchQuery.trim() || hasActiveFilters) ? (
                <View className="px-6">
                  <View className="flex-row flex-wrap gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton
                        key={i}
                        width={isDesktop ? "22%" : isTablet ? "30%" : "45%"}
                        height={280}
                        borderRadius={12}
                      />
                    ))}
                  </View>
                </View>
              ) : error ? (
                <View className="px-6 py-12">
                  <EmptyState
                    title="Search Error"
                    message={
                      error.includes("Failed to fetch")
                        ? "Network error: Unable to reach server."
                        : `Error: ${error}`
                    }
                  />
                </View>
              ) : searchQuery.trim() && movies.length === 0 && !loading ? (
                <EmptyState
                  title="No movies found"
                  message={`We couldn't find any movies matching "${searchQuery}"`}
                />
              ) : !searchQuery.trim() && !hasActiveFilters ? (
                <View className="px-6 py-12">
                  <EmptyState
                    title="Start exploring"
                    message="Search for movies, select a category, or use filters to discover amazing films"
                  />
                </View>
              ) : movies.length > 0 ? (
                <View className="px-6 pb-32">
                  <View className="mb-6">
                    <Text className="text-text-primary text-2xl md:text-3xl font-bold mb-2">
                      {getFilterTitle()}
                    </Text>
                    <Text className="text-text-secondary text-base mb-4">
                      Found{" "}
                      <Text className="text-accent-primary font-bold">
                        {movies.length}
                      </Text>{" "}
                      {movies.length === 1 ? "movie" : "movies"}
                      {searchQuery.trim() && (
                        <>
                          {" "}
                          for{" "}
                          <Text className="text-accent-primary font-semibold">
                            "{searchQuery}"
                          </Text>
                        </>
                      )}
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-4">
                    {movies.map((item) => (
                      <View
                        key={item.id}
                        style={{
                          width: isDesktop ? "22%" : isTablet ? "30%" : "45%",
                        }}
                      >
                        <MovieCard
                          {...item}
                          size={isDesktop ? "medium" : "small"}
                          showRating={true}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        {/* Filters Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View className="flex-1 bg-black/30 justify-end">
            <View className="bg-bg-primary rounded-t-3xl p-6 max-h-[80%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-text-primary text-2xl font-bold">
                  Filters
                </Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text className="text-accent-primary text-base font-semibold">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Filters */}
                <View className="mb-6">
                  <Text className="text-text-primary text-lg font-bold mb-4">
                    Quick Filters
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {[
                      { key: "popular", label: "Popular" },
                      { key: "top-rated", label: "Top Rated" },
                      { key: "now-playing", label: "Now Playing" },
                      { key: "upcoming", label: "Coming Soon" },
                      { key: "a-list", label: "A-List" },
                    ].map((filter) => (
                      <TouchableOpacity
                        key={filter.key}
                        onPress={() => {
                          setSelectedFilter(filter.key);
                          setSearchQuery("");
                          setSelectedGenre(null);
                          setSelectedYear(null);
                        }}
                        className={`px-4 py-2 rounded-full ${
                          selectedFilter === filter.key
                            ? "bg-accent-primary"
                            : "bg-bg-elevated border border-border-primary"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selectedFilter === filter.key
                              ? "text-white"
                              : "text-text-primary"
                          }`}
                        >
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Genre Filter */}
                <View className="mb-6">
                  <Text className="text-text-primary text-lg font-bold mb-4">
                    Genres
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {genres.map((genre: Genre) => (
                      <TouchableOpacity
                        key={genre.id}
                        onPress={() => {
                          const newGenre =
                            selectedGenre === genre.id ? null : genre.id;
                          setSelectedGenre(newGenre);
                          if (newGenre) {
                            setSelectedGenreObj(genre);
                          } else {
                            setSelectedGenreObj(null);
                          }
                          setSelectedFilter(null);
                          setSearchQuery("");
                        }}
                        className={`px-4 py-2 rounded-full ${
                          selectedGenre === genre.id
                            ? "bg-accent-primary"
                            : "bg-bg-elevated border border-border-primary"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selectedGenre === genre.id
                              ? "text-white"
                              : "text-text-primary"
                          }`}
                        >
                          {genre.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Year Filter */}
                <View className="mb-6">
                  <Text className="text-text-primary text-lg font-bold mb-4">
                    Year
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {years.slice(0, 20).map((year) => (
                      <TouchableOpacity
                        key={year}
                        onPress={() => {
                          setSelectedYear(selectedYear === year ? null : year);
                          setSelectedFilter(null);
                          setSearchQuery("");
                        }}
                        className={`px-4 py-2 rounded-full ${
                          selectedYear === year
                            ? "bg-accent-primary"
                            : "bg-bg-elevated border border-border-primary"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selectedYear === year
                              ? "text-white"
                              : "text-text-primary"
                          }`}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Search;
