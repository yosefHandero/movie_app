import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, Platform, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const GradientBackground: React.FC = () => {
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  useEffect(() => {
    // Create flowing animation with different speeds for depth
    progress1.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    progress2.value = withRepeat(
      withTiming(1, {
        duration: 12000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    progress3.value = withRepeat(
      withTiming(1, {
        duration: 15000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress1.value,
      [0, 1],
      [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5]
    );
    const translateY = interpolate(
      progress1.value,
      [0, 1],
      [-SCREEN_HEIGHT * 0.3, SCREEN_HEIGHT * 0.3]
    );
    const scale = interpolate(progress1.value, [0, 1], [0.8, 1.2]);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: 0.4,
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress2.value,
      [0, 1],
      [SCREEN_WIDTH * 0.3, -SCREEN_WIDTH * 0.3]
    );
    const translateY = interpolate(
      progress2.value,
      [0, 1],
      [SCREEN_HEIGHT * 0.2, -SCREEN_HEIGHT * 0.2]
    );
    const scale = interpolate(progress2.value, [0, 1], [1, 0.9]);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: 0.35,
    };
  });

  const animatedStyle3 = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress3.value,
      [0, 1],
      [-SCREEN_WIDTH * 0.4, SCREEN_WIDTH * 0.4]
    );
    const translateY = interpolate(
      progress3.value,
      [0, 1],
      [SCREEN_HEIGHT * 0.4, -SCREEN_HEIGHT * 0.4]
    );
    const scale = interpolate(progress3.value, [0, 1], [1.1, 0.8]);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: 0.3,
    };
  });

  const absoluteFill = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };

  return (
    <View style={absoluteFill} pointerEvents="none">
      {/* Base dark background */}
      <View style={[absoluteFill, { backgroundColor: "#3C1B58" }]} />

      {/* Flowing gradient layers - muted purple palette */}
      <AnimatedLinearGradient
        colors={["#5F4295", "#7C5BD0", "#855FDE", "#65449F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[absoluteFill, animatedStyle1]}
      />

      <AnimatedLinearGradient
        colors={["#65449F", "#5F4295", "#7C5BD0", "#855FDE"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[absoluteFill, animatedStyle2]}
      />

      <AnimatedLinearGradient
        colors={["#7C5BD0", "#855FDE", "#65449F", "#5F4295"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[absoluteFill, animatedStyle3]}
      />

      {/* Overlay for better text readability */}
      <View
        style={[
          absoluteFill,
          {
            backgroundColor:
              Platform.OS === "web"
                ? "rgba(60, 27, 88, 0.15)"
                : "rgba(60, 27, 88, 0.25)",
          },
        ]}
      />
    </View>
  );
};
