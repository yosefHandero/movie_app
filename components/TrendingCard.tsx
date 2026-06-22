import { TrendingCardProps } from "@/interfaces/interfaces";
import { Link } from "expo-router";
import React, { useState } from "react";
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

export const TrendingCard: React.FC<TrendingCardProps> = ({
  movie: { movie_id, title, poster_url },
  index,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const imageOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (!imageLoading) {
      imageOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [imageLoading]);

  const handlePressIn = () => {
    scale.value = withSpring(1.01, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(-2, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  const cardSurfaceStyle = {
    borderRadius: 14,
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.32)",
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 9,
    ...(Platform.OS === "web"
      ? {
          // @ts-ignore - web-only style
          boxShadow:
            "0 0 24px rgba(167, 139, 250, 0.38), 0 14px 24px rgba(0, 0, 0, 0.65)",
        }
      : {}),
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  // Responsive width for web and mobile
  const cardWidth = Platform.OS === "web" ? "w-36 min-w-[144px]" : "w-36";

  return (
    <Link href={`/movie/${movie_id}`} asChild>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`${cardWidth} relative mr-4`}
        style={animatedStyle}
        // @ts-ignore - web-only props
        onMouseEnter={
          Platform.OS === "web"
            ? () => {
                scale.value = withSpring(1.05, { damping: 15, stiffness: 300 });
                translateY.value = withSpring(-4, {
                  damping: 15,
                  stiffness: 300,
                });
              }
            : undefined
        }
        onMouseLeave={
          Platform.OS === "web"
            ? () => {
                scale.value = withSpring(1, { damping: 15, stiffness: 300 });
                translateY.value = withSpring(0, {
                  damping: 15,
                  stiffness: 300,
                });
              }
            : undefined
        }
      >
        <View style={cardSurfaceStyle}>
          {imageLoading && (
            <View className="absolute inset-0 w-36 h-56 rounded-xl overflow-hidden">
              <Skeleton width={144} height={224} borderRadius={12} />
            </View>
          )}
          <AnimatedImage
            source={{ uri: poster_url }}
            className="w-36 h-56 rounded-xl"
            resizeMode="cover"
            style={imageAnimatedStyle}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {imageError && (
            <View className="absolute inset-0 w-36 h-56 rounded-xl bg-bg-tertiary items-center justify-center">
              <Text className="text-text-tertiary text-xs">No Image</Text>
            </View>
          )}

          {/* Ranking badge */}
          <View className="absolute -top-2 -left-2">
            <Badge label={`#${index + 1}`} variant="accent" size="sm" />
          </View>
        </View>

        {/* Title */}
        <Text
          className="text-text-primary text-sm font-bold mt-2"
          numberOfLines={2}
        >
          {title}
        </Text>
      </AnimatedPressable>
    </Link>
  );
};

export default TrendingCard;
