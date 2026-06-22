import {
  MovieInsightBadges,
  WhyWatchThis,
} from "@/components/insights";
import { glassCardStyle } from "@/constants/glass";
import { Movie } from "@/interfaces/interfaces";
import { getWhyWatch } from "@/utils/movieInsights";
import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
  showInsights?: boolean;
  className?: string;
}

const MovieCardComponent: React.FC<MovieCardProps> = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  genre_ids,
  overview,
  adult,
  popularity,
  vote_count,
  size = "small",
  showRating = true,
  showInsights = false,
  className = "",
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const imageOpacity = useSharedValue(0);

  const movieInsightInput = useMemo(
    () => ({
      genre_ids,
      vote_average,
      popularity,
      overview,
      adult,
      vote_count,
      release_date,
    }),
    [
      genre_ids,
      vote_average,
      popularity,
      overview,
      adult,
      vote_count,
      release_date,
    ]
  );

  const whyWatch = useMemo(
    () => (showInsights ? getWhyWatch(movieInsightInput) : ""),
    [showInsights, movieInsightInput]
  );

  useEffect(() => {
    if (!imageLoading) {
      imageOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [imageLoading, imageOpacity]);

  const handlePressIn = () => {
    scale.value = withSpring(1.01, { damping: 20, stiffness: 400 });
    translateY.value = withSpring(-2, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const sizeClasses = {
    small: "w-full",
    medium: "w-full",
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

  const cardSurfaceStyle = {
    borderRadius: 14,
    ...glassCardStyle,
    backgroundColor: "rgba(34, 20, 56, 0.65)",
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: Platform.OS === "web" ? 10 : 6 },
    shadowOpacity: Platform.OS === "web" ? 0.34 : 0.22,
    shadowRadius: Platform.OS === "web" ? 20 : 12,
    elevation: Platform.OS === "web" ? 9 : 6,
    ...(Platform.OS === "web"
      ? {
          // @ts-ignore - web-only style
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow:
            "0 0 24px rgba(167, 139, 250, 0.25), 0 12px 28px rgba(0, 0, 0, 0.5)",
          cursor: "pointer",
        }
      : {}),
  };

  return (
    <View className={`${sizeClasses[size]} ${className}`}>
      <Animated.View style={animatedStyle} className="relative">
        <Link href={`/movie/${id}`} asChild>
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="relative rounded-xl overflow-hidden"
            style={cardSurfaceStyle as any}
            // @ts-ignore - web-only props
            onMouseEnter={
              Platform.OS === "web"
                ? () => {
                    scale.value = withSpring(1.03, {
                      damping: 15,
                      stiffness: 300,
                    });
                    translateY.value = withSpring(-4, {
                      damping: 15,
                      stiffness: 300,
                    });
                  }
                : undefined
            }
            // @ts-ignore - web-only props
            onMouseLeave={
              Platform.OS === "web"
                ? () => {
                    scale.value = withSpring(1, {
                      damping: 15,
                      stiffness: 300,
                    });
                    translateY.value = withSpring(0, {
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

        {showRating && vote_average > 0 && (
          <View className="absolute bottom-2 left-2">
            <Badge
              label={`${Math.round(vote_average / 2)}/5`}
              variant="accent"
              size="sm"
            />
          </View>
        )}
      </Animated.View>

      <View className="mt-2.5">
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

        {showInsights && (
          <View className="mt-2 gap-2">
            <MovieInsightBadges movie={movieInsightInput} compact />
            <WhyWatchThis text={whyWatch} compact />
          </View>
        )}
      </View>
    </View>
  );
};

export const MovieCard = React.memo(MovieCardComponent);

export default MovieCard;
