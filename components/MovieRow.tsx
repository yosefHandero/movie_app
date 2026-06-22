import { Movie } from "@/interfaces/interfaces";
import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import MovieCard from "./MovieCard";
import TrendingCard from "./TrendingCard";
import { Skeleton } from "./ui/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isDesktop = SCREEN_WIDTH >= 1024;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MovieRowProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  variant?: "default" | "trending";
  numItems?: number;
}

const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  loading = false,
  showSeeAll = true,
  onSeeAll,
  variant = "default",
  numItems,
}) => {
  const displayMovies = numItems ? movies.slice(0, numItems) : movies;

  if (loading) {
    return (
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4 px-6">
          <Skeleton width={150} height={20} borderRadius={8} />
          {showSeeAll && <Skeleton width={60} height={16} borderRadius={8} />}
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[1, 2, 3]}
          renderItem={() => (
            <View className="ml-6">
              <Skeleton
                width={variant === "trending" ? 180 : 120}
                height={variant === "trending" ? 260 : 180}
                borderRadius={12}
              />
            </View>
          )}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ paddingRight: 24 }}
        />
      </View>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  // Animated card component with better spacing and carousel effects
  const AnimatedMovieCard = ({
    item,
    index,
  }: {
    item: Movie;
    index: number;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    if (variant === "trending") {
      return (
        <View
          className={index === 0 ? "ml-6" : "ml-4"}
        >
          <TrendingCard
            movie={{
              searchTerm: item.title,
              movie_id: item.id,
              title: item.title,
              count: item.vote_count,
              poster_url: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : "",
            }}
            index={index}
          />
        </View>
      );
    }

    return (
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className={index === 0 ? "ml-6" : "ml-4"}
        activeOpacity={0.9}
        // @ts-ignore - web-only props
        onMouseEnter={
          Platform.OS === "web"
            ? () => {
                scale.value = withSpring(1.05, { damping: 15, stiffness: 300 });
              }
            : undefined
        }
        // @ts-ignore - web-only props
        onMouseLeave={
          Platform.OS === "web"
            ? () => {
                scale.value = withSpring(1, { damping: 15, stiffness: 300 });
              }
            : undefined
        }
      >
        <MovieCard
          {...item}
          size={isDesktop ? "medium" : "small"}
          showRating={true}
          showInsights={true}
        />
      </AnimatedTouchable>
    );
  };

  return (
    <View className="mb-10" style={{ width: "100%", maxWidth: "100%" }}>
      <View className="flex-row items-center justify-between mb-4 px-6">
        <View className="flex-1">
          <Text className="text-text-primary text-2xl font-bold mb-1">
            {title}
          </Text>
          <Text className="text-text-tertiary text-sm">
            {displayMovies.length}{" "}
            {displayMovies.length === 1 ? "movie" : "movies"}
          </Text>
        </View>
        {showSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
            className="px-3 py-2 rounded-full bg-bg-secondary border border-border-primary ml-4"
          >
            <Text className="text-accent-primary text-base font-semibold">
              See all
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={displayMovies}
        renderItem={({ item, index }) => (
          <AnimatedMovieCard item={item} index={index} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingRight: 24,
          paddingLeft: 0, // Handled by ml-6 on first item
        }}
        // Enhanced carousel snap behavior
        snapToInterval={variant === "trending" ? 160 : 140}
        snapToAlignment="start"
        decelerationRate={0.9} // Smoother deceleration
        pagingEnabled={false}
        // Smooth scrolling
        scrollEventThrottle={16}
        // Better scroll performance - optimized for web and mobile
        removeClippedSubviews={Platform.OS !== "web"}
        initialNumToRender={Platform.OS === "web" ? 8 : 5}
        maxToRenderPerBatch={Platform.OS === "web" ? 8 : 5}
        windowSize={Platform.OS === "web" ? 10 : 5}
        // Momentum scrolling with bounce
        bounces={true}
        bouncesZoom={false}
        alwaysBounceHorizontal={true}
        alwaysBounceVertical={false}
        // Smooth momentum
        directionalLockEnabled={true}
        // Better touch handling
        overScrollMode="auto"
        // Web optimizations - apply web-only styles via className or remove if not needed
      />
    </View>
  );
};

export default MovieRow;
