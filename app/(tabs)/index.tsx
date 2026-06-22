import { CategoryPillsLoop } from "@/components/CategoryPillsLoop";
import { GradientBackground } from "@/components/GradientBackground";
import { Header } from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import { SurpriseMeButton } from "@/components/insights";
import MovieCard from "@/components/MovieCard";
import MovieRow from "@/components/MovieRow";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  fetchAListMovies,
  fetchGenres,
  fetchMovies,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "@/services/api";
import { getTrendingMovies } from "@/services/backend";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
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
const isSmallPhone = SCREEN_WIDTH < 400;

const Index = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const fetchMoviesCallback = useCallback(() => fetchMovies({ query: "" }), []);
  const trendingMoviesCallback = useCallback(() => getTrendingMovies(), []);
  const topRatedCallback = useCallback(() => fetchTopRatedMovies(1), []);
  const nowPlayingCallback = useCallback(() => fetchNowPlayingMovies(1), []);
  const upcomingCallback = useCallback(() => fetchUpcomingMovies(1), []);
  const popularCallback = useCallback(() => fetchPopularMovies(1), []);
  const aListCallback = useCallback(() => fetchAListMovies(1), []);
  const fetchGenresCallback = useCallback(() => fetchGenres(), []);

  const {
    data: trendingMovies,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(trendingMoviesCallback);

  const {
    data: movies,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(fetchMoviesCallback);

  const {
    data: topRatedMovies = [],
    loading: topRatedLoading,
    refetch: refetchTopRated,
  } = useFetch(topRatedCallback);

  const {
    data: nowPlayingMovies = [],
    loading: nowPlayingLoading,
    refetch: refetchNowPlaying,
  } = useFetch(nowPlayingCallback);

  const {
    data: upcomingMovies = [],
    loading: upcomingLoading,
    refetch: refetchUpcoming,
  } = useFetch(upcomingCallback);

  const {
    data: popularMovies = [],
    loading: popularLoading,
    refetch: refetchPopular,
  } = useFetch(popularCallback);

  const {
    data: aListMovies = [],
    loading: aListLoading,
    refetch: refetchAList,
  } = useFetch(aListCallback);

  const { data: genres = [], loading: genresLoading } =
    useFetch(fetchGenresCallback);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Promise.allSettled always resolves, so we check results array for failures
    const results = await Promise.allSettled([
      refetchTrending(),
      refetchMovies(),
      refetchTopRated(),
      refetchNowPlaying(),
      refetchUpcoming(),
      refetchPopular(),
      refetchAList(),
    ]);

    // Check for individual failures if needed
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      console.warn(`${failures.length} refresh requests failed`);
      // Could show a toast notification here
    }

    setRefreshing(false);
  }, [
    refetchTrending,
    refetchMovies,
    refetchTopRated,
    refetchNowPlaying,
    refetchUpcoming,
    refetchPopular,
    refetchAList,
  ]);

  // Get featured movie for hero banner (use first movie from latest movies) - memoized
  const featuredMovie = useMemo(() => movies?.[0] || null, [movies]);

  // Memoize numColumns calculation
  const numColumns = useMemo(
    () => (isSmallPhone ? 1 : isDesktop ? 4 : isTablet ? 3 : 2),
    [isDesktop, isTablet, isSmallPhone]
  );

  // Memoize latest movies slice to avoid unnecessary re-renders
  const latestMovies = useMemo(() => {
    if (!movies || !Array.isArray(movies)) return [];
    return movies.slice(0, 12);
  }, [movies]);

  const surprisePool = useMemo(() => {
    const pool = [
      ...(movies || []),
      ...topRatedMovies,
      ...nowPlayingMovies,
      ...upcomingMovies,
      ...popularMovies,
      ...aListMovies,
    ];
    const seen = new Set<number>();
    return pool.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [
    movies,
    topRatedMovies,
    nowPlayingMovies,
    upcomingMovies,
    popularMovies,
    aListMovies,
  ]);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <GradientBackground />
      <View className="flex-1" style={{ maxWidth: "100%", width: "100%" }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: "100%", maxWidth: "100%" }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {/* Header with Logo */}
          <Header />

          {/* Surprise Me + Search */}
          <View className="px-6 mb-4 flex-row items-center justify-center gap-3 flex-wrap">
            <SurpriseMeButton movies={surprisePool} />
          </View>

          {/* Search Bar - Centered and Shorter */}
          <View className="px-6 mb-4 items-center">
            <View className="w-full max-w-sm">
              <SearchBar
                placeholder="Search for a movie..."
                value=""
                onChangeText={() => {
                  // Navigate to search when user starts typing
                  router.push("/(tabs)/search");
                }}
                onPress={() => router.push("/(tabs)/search")}
              />
            </View>
          </View>

          {/* Categories/Genres Section - Hidden on large screens */}
          {!isDesktop && (
            <View className="mb-5">
              <View className="px-6 mb-2">
                <Text className="text-text-primary text-lg font-bold">
                  Browse by Category
                </Text>
              </View>
              <CategoryPillsLoop genres={genres} loading={genresLoading} />
            </View>
          )}

          {/* Hero Banner */}
          {featuredMovie && (
            <View className="mb-8">
              <HeroBanner movie={featuredMovie} />
            </View>
          )}

          {moviesError || trendingError ? (
            <View className="px-6 py-12">
              <EmptyState
                title="Something went wrong"
                message={
                  moviesError || trendingError || "Failed to load movies"
                }
              />
            </View>
          ) : (
            <View className="pb-8" style={{ width: "100%", maxWidth: "100%" }}>
              {/* Trending Movies */}
              {trendingMovies && trendingMovies.length > 0 && (
                <View className="mb-10" style={{ width: "100%" }}>
                  <View className="flex-row items-center justify-between mb-4 px-6">
                    <View>
                      <Text className="text-text-primary text-2xl font-bold mb-1">
                        Trending Now
                      </Text>
                      <Text className="text-text-tertiary text-sm">
                        Popular searches
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/search")}
                      activeOpacity={0.7}
                      className="px-3 py-2 rounded-full bg-bg-secondary border border-border-primary"
                    >
                      <Text className="text-accent-primary text-base font-semibold">
                        See all
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={trendingMovies}
                    renderItem={({ item, index }) => (
                      <TrendingCard movie={item} index={index} />
                    )}
                    keyExtractor={(item) => item.movie_id.toString()}
                    contentContainerStyle={{
                      paddingLeft: 24,
                      paddingRight: 24,
                    }}
                    ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
                    scrollEventThrottle={16}
                    bounces={true}
                    alwaysBounceHorizontal={true}
                    decelerationRate="fast"
                    removeClippedSubviews={Platform.OS !== "web"}
                    initialNumToRender={Platform.OS === "web" ? 8 : 5}
                    maxToRenderPerBatch={Platform.OS === "web" ? 8 : 5}
                    windowSize={Platform.OS === "web" ? 10 : 5}
                    getItemLayout={(data, index) => {
                      // Card width is 144px (w-36) + 16px margin = 160px total
                      const itemWidth = 160;
                      return {
                        length: itemWidth,
                        offset: itemWidth * index,
                        index,
                      };
                    }}
                  />
                </View>
              )}

              {/* A-List Movies (High-Rated Blockbusters) */}
              <MovieRow
                title="A-List Watchlist"
                movies={aListMovies}
                loading={aListLoading}
                numItems={10}
                onSeeAll={() => router.push("/(tabs)/search")}
              />

              {/* Top Rated Movies */}
              <MovieRow
                title="Top Rated"
                movies={topRatedMovies}
                loading={topRatedLoading}
                numItems={10}
                onSeeAll={() => router.push("/(tabs)/search")}
              />

              {/* Now Playing */}
              <MovieRow
                title="Now Playing"
                movies={nowPlayingMovies}
                loading={nowPlayingLoading}
                numItems={10}
                onSeeAll={() => router.push("/(tabs)/search")}
              />

              {/* Popular This Week */}
              <MovieRow
                title="Popular This Week"
                movies={popularMovies}
                loading={popularLoading}
                numItems={10}
                onSeeAll={() => router.push("/(tabs)/search")}
              />

              {/* Upcoming Movies */}
              <MovieRow
                title="Coming Soon"
                movies={upcomingMovies}
                loading={upcomingLoading}
                numItems={10}
                onSeeAll={() => router.push("/(tabs)/search")}
              />

              {/* Latest Movies Grid */}
              {movies && movies.length > 0 && (
                <View
                  className="px-6 mt-8"
                  style={{ width: "100%", maxWidth: "100%" }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                      <Text className="text-text-primary text-2xl font-bold mb-1">
                        Latest Movies
                      </Text>
                      <Text className="text-text-tertiary text-sm">
                        Discover new releases
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/search")}
                      activeOpacity={0.7}
                      className="px-3 py-2 rounded-full bg-bg-secondary border border-border-primary ml-4"
                    >
                      <Text className="text-accent-primary text-base font-semibold">
                        See all
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={latestMovies}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          flex: isSmallPhone ? undefined : 1,
                          maxWidth: isSmallPhone ? "100%" : `${100 / numColumns}%`,
                          paddingHorizontal: isSmallPhone ? 0 : 4,
                        }}
                      >
                        <MovieCard
                          {...item}
                          size={isSmallPhone ? "large" : isDesktop ? "medium" : "small"}
                          showRating={true}
                          showInsights={true}
                          className={isDesktop ? "mb-6" : "mb-4"}
                        />
                      </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={numColumns}
                    columnWrapperStyle={
                      numColumns > 1
                        ? {
                            justifyContent: "flex-start",
                            gap: isDesktop ? 20 : 16,
                            marginBottom: isDesktop ? 24 : 16,
                          }
                        : undefined
                    }
                    scrollEnabled={false}
                    // Performance optimizations
                    removeClippedSubviews={Platform.OS !== "web"}
                    initialNumToRender={Platform.OS === "web" ? 12 : 6}
                    maxToRenderPerBatch={Platform.OS === "web" ? 12 : 6}
                    windowSize={Platform.OS === "web" ? 10 : 5}
                    ListEmptyComponent={
                      <EmptyState
                        title="No movies found"
                        message="Try refreshing or check your connection"
                      />
                    }
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Index;
