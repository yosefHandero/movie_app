import { GradientBackground } from "@/components/GradientBackground";
import HeroBanner from "@/components/HeroBanner";
import MovieCard from "@/components/MovieCard";
import MovieRow from "@/components/MovieRow";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { icons } from "@/constants/icons";
import { Genre } from "@/interfaces/interfaces";
import {
  fetchAListMovies,
  fetchGenres,
  fetchMovies,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "@/services/api";
import { getTrendingMovies } from "@/services/supabase";
import useFetch from "@/services/useFetch";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Index = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const trendingFlatListRef = useRef<FlatList>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

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
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(trendingMoviesCallback);

  const {
    data: movies,
    loading: moviesLoading,
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Get featured movie for hero banner (use first movie from latest movies) - memoized
  const featuredMovie = useMemo(() => movies?.[0] || null, [movies]);

  // Memoize numColumns calculation
  const numColumns = useMemo(
    () => (isDesktop ? 4 : isTablet ? 3 : 2),
    [isDesktop, isTablet]
  );

  // Memoize latest movies slice to avoid unnecessary re-renders
  const latestMovies = useMemo(() => movies?.slice(0, 12) || [], [movies]);

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    if (!trendingMovies || trendingMovies.length <= 1) return;

    const startAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }

      autoScrollTimerRef.current = setInterval(() => {
        if (trendingFlatListRef.current && trendingMovies.length > 0) {
          const nextIndex =
            (currentIndexRef.current + 1) % trendingMovies.length;
          currentIndexRef.current = nextIndex;

          try {
            // Use scrollToIndex for more reliable scrolling
            trendingFlatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
              viewPosition: 0.1, // Position item at 10% from left
            });
          } catch (error) {
            // Fallback to scrollToOffset if scrollToIndex fails
            const itemWidth = 160;
            const scrollToX = nextIndex * itemWidth;
            trendingFlatListRef.current.scrollToOffset({
              offset: scrollToX,
              animated: true,
            });
          }
        }
      }, 3000); // 3 seconds
    };

    // Small delay to ensure FlatList is rendered
    const initTimer = setTimeout(() => {
      startAutoScroll();
    }, 500);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
      if (initTimer) {
        clearTimeout(initTimer);
      }
      if (restartAutoScrollRef.current) {
        clearTimeout(restartAutoScrollRef.current);
        restartAutoScrollRef.current = null;
      }
    };
  }, [trendingMovies]);

  // Handle manual scroll - pause auto-scroll temporarily
  const handleTrendingScrollBegin = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    // Also clear restart timer if user starts scrolling
    if (restartAutoScrollRef.current) {
      clearTimeout(restartAutoScrollRef.current);
      restartAutoScrollRef.current = null;
    }
  }, []);

  // Genre Button Component
  const GenreButton = ({ genre }: { genre: Genre }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    return (
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          router.push("/(tabs)/search");
        }}
        style={animatedStyle}
        className="px-5 py-2.5 rounded-full mr-3 mb-3 bg-bg-elevated border border-border-primary"
      >
        <Text className="text-sm font-semibold text-text-primary">
          {genre.name}
        </Text>
      </AnimatedTouchable>
    );
  };

  // Restart auto-scroll after user stops scrolling
  const restartAutoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const handleTrendingScrollEnd = useCallback(() => {
    if (!trendingMovies || trendingMovies.length <= 1) return;

    // Clear any existing restart timer
    if (restartAutoScrollRef.current) {
      clearTimeout(restartAutoScrollRef.current);
    }

    // Restart auto-scroll after 5 seconds of no interaction
    restartAutoScrollRef.current = setTimeout(() => {
      if (trendingFlatListRef.current && trendingMovies.length > 0) {
        autoScrollTimerRef.current = setInterval(() => {
          if (trendingFlatListRef.current && trendingMovies.length > 0) {
            const nextIndex =
              (currentIndexRef.current + 1) % trendingMovies.length;
            currentIndexRef.current = nextIndex;

            try {
              trendingFlatListRef.current.scrollToIndex({
                index: nextIndex,
                animated: true,
                viewPosition: 0.1,
              });
            } catch (error) {
              // Fallback to scrollToOffset if scrollToIndex fails
              const itemWidth = 160;
              const scrollToX = nextIndex * itemWidth;
              trendingFlatListRef.current.scrollToOffset({
                offset: scrollToX,
                animated: true,
              });
            }
          }
        }, 3000);
      }
    }, 5000);
  }, [trendingMovies, isDesktop, isTablet]);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <GradientBackground />
      <AnimatedScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
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
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-center">
          <Image
            source={icons.logo}
            className="w-14 h-12"
            contentFit="contain"
          />
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

        {/* Categories/Genres Section */}
        <View className="mb-6">
          <View className="px-6 mb-3">
            <Text className="text-text-primary text-xl font-bold">
              Browse by Category
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
          >
            {genresLoading ? (
              <View className="flex-row gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    width={100}
                    height={36}
                    borderRadius={18}
                    className="mr-3"
                  />
                ))}
              </View>
            ) : genres.length > 0 ? (
              genres.map((genre) => (
                <GenreButton key={genre.id} genre={genre} />
              ))
            ) : null}
          </ScrollView>
        </View>

        {/* Hero Banner */}
        {featuredMovie && (
          <View className="mb-10">
            <HeroBanner movie={featuredMovie} />
          </View>
        )}

        {/* Loading State */}
        {(moviesLoading || trendingLoading) && !refreshing ? (
          <View className="px-6">
            <Skeleton
              width="100%"
              height={200}
              borderRadius={12}
              className="mb-4"
            />
            <View className="flex-row gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="30%" height={250} borderRadius={12} />
              ))}
            </View>
          </View>
        ) : moviesError || trendingError ? (
          <View className="px-6 py-12">
            <EmptyState
              title="Something went wrong"
              message={moviesError || trendingError || "Failed to load movies"}
            />
          </View>
        ) : (
          <View className="pb-32">
            {/* Trending Movies */}
            {trendingMovies && trendingMovies.length > 0 && (
              <View className="mb-14">
                <View className="flex-row items-center justify-between mb-6 px-6">
                  <View>
                    <Text className="text-text-primary text-3xl font-bold mb-1">
                      Trending Now
                    </Text>
                    <Text className="text-text-tertiary text-sm">
                      What's hot right now
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/search")}
                    activeOpacity={0.7}
                    className="px-4 py-2 rounded-full bg-accent-primary/10"
                  >
                    <Text className="text-accent-primary text-base font-semibold">
                      See All →
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  ref={trendingFlatListRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingMovies}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                  contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
                  ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
                  // Enhanced carousel
                  scrollEventThrottle={16}
                  bounces={true}
                  alwaysBounceHorizontal={true}
                  decelerationRate="fast"
                  onScrollBeginDrag={handleTrendingScrollBegin}
                  onScrollEndDrag={handleTrendingScrollEnd}
                  onMomentumScrollEnd={(event) => {
                    // Update current index based on scroll position
                    const offsetX = event.nativeEvent.contentOffset.x;
                    // Card width is 144px (w-36) + 16px margin = 160px total
                    const itemWidth = 160;
                    const newIndex = Math.max(
                      0,
                      Math.min(
                        Math.round(offsetX / itemWidth),
                        (trendingMovies?.length || 1) - 1
                      )
                    );
                    currentIndexRef.current = newIndex;
                    handleTrendingScrollEnd();
                  }}
                  onScrollToIndexFailed={(info) => {
                    // Handle scroll to index failure gracefully
                    const wait = new Promise((resolve) =>
                      setTimeout(resolve, 500)
                    );
                    wait.then(() => {
                      if (trendingFlatListRef.current) {
                        try {
                          trendingFlatListRef.current.scrollToIndex({
                            index: info.index,
                            animated: true,
                            viewPosition: 0.1,
                          });
                        } catch (error) {
                          // Final fallback to scrollToOffset
                          const itemWidth = 160;
                          const scrollToX = info.index * itemWidth;
                          trendingFlatListRef.current.scrollToOffset({
                            offset: scrollToX,
                            animated: true,
                          });
                        }
                      }
                    });
                  }}
                  // Optimize for web and mobile
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
              onSeeAll={() =>
                router.push({
                  pathname: "/(tabs)/search",
                  params: { filter: "a-list" },
                })
              }
            />

            {/* Top Rated Movies */}
            <MovieRow
              title="Top Rated"
              movies={topRatedMovies}
              loading={topRatedLoading}
              numItems={10}
              onSeeAll={() =>
                router.push({
                  pathname: "/(tabs)/search",
                  params: { filter: "top-rated" },
                })
              }
            />

            {/* Now Playing */}
            <MovieRow
              title="Now Playing"
              movies={nowPlayingMovies}
              loading={nowPlayingLoading}
              numItems={10}
              onSeeAll={() =>
                router.push({
                  pathname: "/(tabs)/search",
                  params: { filter: "now-playing" },
                })
              }
            />

            {/* Popular This Week */}
            <MovieRow
              title="Popular This Week"
              movies={popularMovies}
              loading={popularLoading}
              numItems={10}
              onSeeAll={() =>
                router.push({
                  pathname: "/(tabs)/search",
                  params: { filter: "popular" },
                })
              }
            />

            {/* Upcoming Movies */}
            <MovieRow
              title="Coming Soon"
              movies={upcomingMovies}
              loading={upcomingLoading}
              numItems={10}
              onSeeAll={() =>
                router.push({
                  pathname: "/(tabs)/search",
                  params: { filter: "upcoming" },
                })
              }
            />

            {/* Latest Movies Grid */}
            {movies && movies.length > 0 && (
              <View className="px-6 mt-8">
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-1">
                    <Text className="text-text-primary text-3xl font-bold mb-1">
                      Latest Movies
                    </Text>
                    <Text className="text-text-tertiary text-sm">
                      Discover new releases
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/search")}
                    activeOpacity={0.7}
                    className="px-4 py-2 rounded-full bg-accent-primary/10 ml-4"
                  >
                    <Text className="text-accent-primary text-base font-semibold">
                      See All →
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={latestMovies}
                  renderItem={({ item }) => (
                    <MovieCard
                      {...item}
                      size={isDesktop ? "medium" : "small"}
                      showRating={true}
                      className={isDesktop ? "mb-6" : "mb-4"}
                    />
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
      </AnimatedScrollView>
    </SafeAreaView>
  );
};

export default Index;
