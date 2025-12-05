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
      <View className="mb-12">
        <View className="flex-row items-center justify-between mb-6 px-6">
          <Skeleton width={200} height={32} borderRadius={8} />
          {showSeeAll && <Skeleton width={80} height={20} borderRadius={8} />}
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[1, 2, 3, 4, 5]}
          renderItem={() => (
            <View className="ml-6">
              <Skeleton
                width={variant === "trending" ? 280 : 160}
                height={variant === "trending" ? 400 : 240}
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

    // Web hover effect for carousel items
    const webHoverStyle =
      Platform.OS === "web"
        ? {
            // @ts-ignore
            transition: "transform 0.2s ease",
            cursor: "pointer",
          }
        : {};

    if (variant === "trending") {
      return (
        <View className={index === 0 ? "ml-6" : "ml-4"} style={webHoverStyle}>
          <TrendingCard movie={item as any} index={index} />
        </View>
      );
    }

    return (
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, webHoverStyle]}
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
        />
      </AnimatedTouchable>
    );
  };

  return (
    <View className="mb-14">
      <View className="flex-row items-center justify-between mb-6 px-6">
        <View className="flex-1">
          <Text className="text-text-primary text-3xl font-bold mb-1">
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
            className="px-4 py-2 rounded-full bg-accent-primary/10 ml-4"
          >
            <Text className="text-accent-primary text-base font-semibold">
              See All →
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
        // Web optimizations
        {...(Platform.OS === "web" && {
          // @ts-ignore - web-only props
          style: { WebkitOverflowScrolling: "touch" },
        })}
      />
    </View>
  );
};

export default MovieRow;
