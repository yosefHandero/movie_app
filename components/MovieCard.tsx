import { Movie } from "@/interfaces/interfaces";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Badge } from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedImage = Animated.createAnimatedComponent(Image);

interface MovieCardProps extends Movie {
  size?: "small" | "medium" | "large";
  showRating?: boolean;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  size = "small",
  showRating = true,
  className = "",
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const scale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);

  useEffect(() => {
    if (!imageLoading) {
      imageOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [imageLoading]);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  // Responsive sizing for web and mobile
  const sizeClasses = {
    small: Platform.OS === "web" ? "w-[30%] min-w-[140px]" : "w-[30%]",
    medium: Platform.OS === "web" ? "w-[45%] min-w-[180px]" : "w-[45%]",
    large: "w-full",
  };

  const imageHeightClasses = {
    small: Platform.OS === "web" ? "h-52 min-h-[208px]" : "h-52",
    medium: Platform.OS === "web" ? "h-64 min-h-[256px]" : "h-64",
    large: "h-80",
  };

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "https://placehold.co/600x400/1a1a1a/FFFFFF.png?text=No+Image";

  // Web hover effect
  const webHoverStyle =
    Platform.OS === "web"
      ? {
          // @ts-ignore - web-only style
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
        }
      : {};

  return (
    <View className={`${sizeClasses[size]} ${className}`}>
      <Animated.View style={animatedStyle} className="relative">
        <Link href={`/movie/${id}`} asChild>
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="relative"
            style={webHoverStyle}
            // @ts-ignore - web-only props
            onMouseEnter={
              Platform.OS === "web"
                ? () => {
                    scale.value = withSpring(1.03, {
                      damping: 15,
                      stiffness: 300,
                    });
                  }
                : undefined
            }
            onMouseLeave={
              Platform.OS === "web"
                ? () => {
                    scale.value = withSpring(1, {
                      damping: 15,
                      stiffness: 300,
                    });
                  }
                : undefined
            }
          >
            {imageLoading && (
              <View
                className={`absolute inset-0 ${imageHeightClasses[size]} rounded-xl overflow-hidden`}
              >
                <Skeleton width="100%" height="100%" borderRadius={12} />
              </View>
            )}
            <AnimatedImage
              source={{ uri: posterUrl }}
              className={`w-full ${imageHeightClasses[size]} rounded-xl`}
              resizeMode="cover"
              style={imageAnimatedStyle}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {imageError && (
              <View
                className={`absolute inset-0 ${imageHeightClasses[size]} rounded-xl bg-bg-tertiary items-center justify-center`}
              >
                <Text className="text-text-tertiary text-xs">No Image</Text>
              </View>
            )}
          </AnimatedPressable>
        </Link>

        {/* Rating badge */}
        {showRating && vote_average > 0 && (
          <View className="absolute bottom-2 left-2">
            <Badge
              label={`${Math.round(vote_average / 2)}★`}
              variant="accent"
              size="sm"
            />
          </View>
        )}
      </Animated.View>

      {/* Title and year */}
      <View className="mt-2">
        <Text
          className="text-text-primary text-sm font-semibold"
          numberOfLines={2}
        >
          {title}
        </Text>
        {release_date && (
          <Text className="text-text-tertiary text-xs mt-1">
            {release_date.split("-")[0]}
          </Text>
        )}
      </View>
    </View>
  );
};

export default MovieCard;
