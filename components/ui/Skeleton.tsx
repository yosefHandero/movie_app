import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  variant?: "default" | "pulse";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
  variant = "default",
}) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-bg-tertiary ${className}`}
      style={[
        {
          width: typeof width === "string" ? width : width,
          height: typeof height === "string" ? height : height,
          borderRadius,
        } as any,
        animatedStyle,
      ]}
    />
  );
};
