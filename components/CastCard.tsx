import { CastMember } from "@/interfaces/interfaces";
import { Image as ExpoImage } from "expo-image";
import React, { useState } from "react";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Skeleton } from "./ui/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isDesktop = SCREEN_WIDTH >= 1024;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CastCardProps {
  cast: CastMember;
  className?: string;
}

export const CastCard: React.FC<CastCardProps> = ({ cast, className = "" }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const scale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);

  React.useEffect(() => {
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

  const profileUrl = cast.profile_path
    ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
    : "https://placehold.co/185x278/1a1a1a/FFFFFF.png?text=No+Photo";

  const webHoverStyle =
    Platform.OS === "web"
      ? {
          // @ts-ignore - web-only style
          transition: "transform 0.2s ease",
          cursor: "pointer",
        }
      : {};

  // Responsive width for web and mobile
  const cardWidth =
    Platform.OS === "web"
      ? isDesktop
        ? "w-32 min-w-[128px]"
        : "w-28 min-w-[112px]"
      : "w-28";

  return (
    <View className={`${cardWidth} ${className}`}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, webHoverStyle]}
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
        <View className="relative mb-3">
          {imageLoading && (
            <View className="absolute inset-0 w-28 h-40 md:w-32 md:h-44 rounded-xl overflow-hidden">
              <Skeleton width="100%" height="100%" borderRadius={12} />
            </View>
          )}
          <Animated.View style={imageAnimatedStyle}>
            <ExpoImage
              source={{ uri: profileUrl }}
              className="w-28 h-40 md:w-32 md:h-44 rounded-xl"
              contentFit="cover"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              transition={300}
            />
          </Animated.View>
          {imageError && (
            <View className="absolute inset-0 w-28 h-40 md:w-32 md:h-44 rounded-xl bg-bg-tertiary items-center justify-center">
              <Text className="text-text-tertiary text-xs text-center px-2">
                No Photo
              </Text>
            </View>
          )}
        </View>
        <Text
          className="text-text-primary text-sm font-semibold mb-1"
          numberOfLines={2}
        >
          {cast.name}
        </Text>
        <Text className="text-text-tertiary text-xs" numberOfLines={2}>
          {cast.character}
        </Text>
      </AnimatedPressable>
    </View>
  );
};

export default CastCard;
