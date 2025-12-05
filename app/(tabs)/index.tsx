import HeroBanner from "@/components/HeroBanner";
import MovieCard from "@/components/MovieCard";
import MovieRow from "@/components/MovieRow";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { icons } from "@/constants/icons";
import {
  fetchAListMovies,
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
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchTrending(),
        refetchMovies(),
        refetchTopRated(),
        refetchNowPlaying(),
        refetchUpcoming(),
        refetchPopular(),
        refetchAList(),
      ]);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
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

    // Calculate item width based on screen size and platform
    const itemWidth =
      Platform.OS === "web" ? (isDesktop ? 180 : isTablet ? 160 : 144) : 144; // 144px (w-36) + 16px margin = ~160px total
    let restartTimer: NodeJS.Timeout | null = null;

    const startAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }

      autoScrollTimerRef.current = setInterval(() => {
        if (trendingFlatListRef.current && trendingMovies.length > 0) {
          currentIndexRef.current =
            (currentIndexRef.current + 1) % trendingMovies.length;
          const scrollToX = currentIndexRef.current * itemWidth;

          trendingFlatListRef.current.scrollToOffset({
            offset: scrollToX,
            animated: true,
          });
        }
      }, 3000); // 3 seconds
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
      if (restartTimer) {
        clearTimeout(restartTimer);
      }
    };
  }, [trendingMovies, isDesktop, isTablet]);

  // Handle manual scroll - pause auto-scroll temporarily
  const handleTrendingScrollBegin = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  // Restart auto-scroll after user stops scrolling
  const restartAutoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const handleTrendingScrollEnd = useCallback(() => {
    if (!trendingMovies || trendingMovies.length <= 1) return;

    // Clear any existing restart timer
    if (restartAutoScrollRef.current) {
      clearTimeout(restartAutoScrollRef.current);
    }

    // Calculate item width based on screen size
    const itemWidth =
      Platform.OS === "web" ? (isDesktop ? 180 : isTablet ? 160 : 144) : 144;

    // Restart auto-scroll after 5 seconds of no interaction
    restartAutoScrollRef.current = setTimeout(() => {
      if (trendingFlatListRef.current && trendingMovies.length > 0) {
        autoScrollTimerRef.current = setInterval(() => {
          if (trendingFlatListRef.current && trendingMovies.length > 0) {
            currentIndexRef.current =
              (currentIndexRef.current + 1) % trendingMovies.length;
            const scrollToX = currentIndexRef.current * itemWidth;

            trendingFlatListRef.current.scrollToOffset({
              offset: scrollToX,
              animated: true,
            });
          }
        }, 3000);
      }
    }, 5000);
  }, [trendingMovies, isDesktop, isTablet]);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={["top"]}>
      <AnimatedScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
        <Animated.View
          style={headerAnimatedStyle}
          className="px-6 pt-8 pb-6 flex-row items-center justify-between"
        >
          <Image
            source={icons.logo}
            className="w-16 h-14"
            contentFit="contain"
          />
        </Animated.View>

        {/* Hero Banner */}
        {featuredMovie && (
          <View className="mb-10">
            <HeroBanner movie={featuredMovie} />
          </View>
        )}

        {/* Search Bar */}
        <View className="px-6 mb-10">
          <SearchBar
            placeholder="Search for a movie..."
            value=""
            onChangeText={() => {}}
            onPress={() => router.push("/(tabs)/search")}
          />
        </View>

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
                    const itemWidth =
                      Platform.OS === "web"
                        ? isDesktop
                          ? 180
                          : isTablet
                          ? 160
                          : 144
                        : 144;
                    currentIndexRef.current = Math.max(
                      0,
                      Math.min(
                        Math.round(offsetX / itemWidth),
                        (trendingMovies?.length || 1) - 1
                      )
                    );
                    handleTrendingScrollEnd();
                  }}
                  // Optimize for web and mobile
                  removeClippedSubviews={Platform.OS !== "web"}
                  initialNumToRender={Platform.OS === "web" ? 8 : 5}
                  maxToRenderPerBatch={Platform.OS === "web" ? 8 : 5}
                  windowSize={Platform.OS === "web" ? 10 : 5}
                  getItemLayout={(data, index) => {
                    const itemWidth =
                      Platform.OS === "web"
                        ? isDesktop
                          ? 180
                          : isTablet
                          ? 160
                          : 144
                        : 144;
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
