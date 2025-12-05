import { Movie } from "@/interfaces/interfaces";
import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Responsive hero height for web and mobile
const HERO_HEIGHT =
  Platform.OS === "web"
    ? Math.min(600, SCREEN_HEIGHT * 0.7)
    : Math.min(500, SCREEN_HEIGHT * 0.6);

interface HeroBannerProps {
  movie: Movie | null;
  onWatchTrailer?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onWatchTrailer,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1.1);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 600 });
    scaleAnim.value = withSpring(1, { damping: 20, stiffness: 100 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, [movie]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
    : "https://placehold.co/1280x720/1a1a1a/FFFFFF.png";

  return (
    <View className="relative overflow-hidden" style={{ height: HERO_HEIGHT }}>
      {/* Backdrop Image */}
      <Animated.View style={imageAnimatedStyle} className="absolute inset-0">
        <ExpoImage
          source={{ uri: backdropUrl }}
          className="w-full h-full"
          contentFit="cover"
          onLoad={() => setImageLoading(false)}
          transition={300}
        />
      </Animated.View>

      {/* Gradient Overlay - Enhanced */}
      <View className="absolute inset-0 bg-black/20" />
      <View className="absolute bottom-0 left-0 right-0 h-3/4 bg-black/90" />

      {/* Content */}
      <Animated.View
        style={contentAnimatedStyle}
        className="absolute bottom-0 left-0 right-0 px-6 pb-12"
      >
        <View className="max-w-2xl">
          {/* Rating and Year */}
          <View className="flex-row items-center gap-3 mb-3">
            {movie.vote_average > 0 && (
              <Badge
                label={`${Math.round(movie.vote_average / 2)}★`}
                variant="accent"
                size="md"
              />
            )}
            {movie.release_date && (
              <Text className="text-text-secondary text-base">
                {movie.release_date.split("-")[0]}
              </Text>
            )}
          </View>

          {/* Title */}
          <Text
            className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight"
            numberOfLines={2}
          >
            {movie.title}
          </Text>

          {/* Overview */}
          {movie.overview && (
            <Text
              className="text-text-secondary text-base mb-6 leading-6"
              numberOfLines={3}
            >
              {movie.overview}
            </Text>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <Link href={`/movie/${movie.id}`} asChild>
              <View>
                <Button
                  title="View Details"
                  onPress={() => {}}
                  variant="primary"
                  size="lg"
                />
              </View>
            </Link>
            {onWatchTrailer && (
              <Button
                title="Watch Trailer"
                onPress={onWatchTrailer}
                variant="outline"
                size="lg"
              />
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default HeroBanner;
