import { BlurView } from "expo-blur";
import React from "react";
import { Platform, TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
  className?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = "default",
  className = "",
  style,
  animated = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
      opacity.value = withTiming(0.9, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 20, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  // Navbar-style texture (blur effect) - more transparent
  const navbarTextureStyle = {
    backgroundColor:
      Platform.OS === "web"
        ? "rgba(165, 165, 169, 0.4)"
        : "rgba(165, 165, 169, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }),
  };

  const variantClasses = {
    default: "bg-bg-tertiary",
    elevated: "", // Will use BlurView instead
    outlined: "bg-transparent border border-border-light",
  };

  const baseClasses = "rounded-xl overflow-hidden transition-all";

  const Component = onPress ? AnimatedTouchable : AnimatedView;

  // Web hover effect
  const webHoverStyle =
    Platform.OS === "web" && onPress
      ? {
          // @ts-ignore - web-only style
          transition: "all 0.2s ease",
          cursor: "pointer",
        }
      : {};

  // Use BlurView for elevated variant to match navbar texture
  if (variant === "elevated") {
    const blurContent = (
      <Component
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={onPress ? 0.9 : 1}
        className={`${baseClasses} ${className}`}
        style={[
          animated && onPress ? animatedStyle : undefined,
          {
            shadowColor: "#8B5CF6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 12,
          },
          style,
          // @ts-ignore - web-only styles
          webHoverStyle,
        ]}
        // @ts-ignore - web-only props
        onMouseEnter={
          Platform.OS === "web" && onPress
            ? () => {
                scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
                opacity.value = withTiming(0.95, { duration: 150 });
              }
            : undefined
        }
        onMouseLeave={
          Platform.OS === "web" && onPress
            ? () => {
                scale.value = withSpring(1, { damping: 15, stiffness: 300 });
                opacity.value = withTiming(1, { duration: 150 });
              }
            : undefined
        }
      >
        {children}
      </Component>
    );

    if (Platform.OS === "web") {
      return (
        <View
          style={[navbarTextureStyle, { borderRadius: 12, overflow: "hidden" }]}
        >
          {blurContent}
        </View>
      );
    }

    return (
      <BlurView
        intensity={20}
        tint="dark"
        style={[navbarTextureStyle, { borderRadius: 12, overflow: "hidden" }]}
      >
        {blurContent}
      </BlurView>
    );
  }

  return (
    <Component
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={onPress ? 0.9 : 1}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={[
        animated && onPress ? animatedStyle : undefined,
        style,
        // @ts-ignore - web-only styles
        webHoverStyle,
      ]}
      // @ts-ignore - web-only props
      onMouseEnter={
        Platform.OS === "web" && onPress
          ? () => {
              scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
              opacity.value = withTiming(0.95, { duration: 150 });
            }
          : undefined
      }
      onMouseLeave={
        Platform.OS === "web" && onPress
          ? () => {
              scale.value = withSpring(1, { damping: 15, stiffness: 300 });
              opacity.value = withTiming(1, { duration: 150 });
            }
          : undefined
      }
    >
      {children}
    </Component>
  );
};
