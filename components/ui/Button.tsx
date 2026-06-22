import React from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className = "",
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  React.useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 });
  }, [disabled]);

  const baseClasses =
    "flex-row items-center justify-center rounded-xl transition-all";

  const variantClasses = {
    primary: "bg-accent-primary",
    secondary: "bg-bg-tertiary border border-border-light",
    ghost: "bg-transparent",
    outline: "bg-bg-secondary border border-border-primary",
  };

  const sizeClasses = {
    sm: "px-4 py-2.5",
    md: "px-6 py-3.5",
    lg: "px-8 py-4.5",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const textVariantClasses = {
    primary: "text-black font-bold",
    secondary: "text-text-primary font-semibold",
    ghost: "text-accent-primary font-semibold",
    outline: "text-accent-primary font-semibold",
  };

  // Web hover effect
  const webHoverStyle =
    Platform.OS === "web"
      ? {
          // @ts-ignore - web-only style
          transition: "all 0.2s ease",
          cursor: disabled || loading ? "not-allowed" : "pointer",
        }
      : {};

  const buttonContent = (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      style={[
        animatedStyle,
        variant === "outline" ? {} : undefined,
        style,
        // @ts-ignore - web-only styles
        webHoverStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      // @ts-ignore - web-only props
      onMouseEnter={
        Platform.OS === "web" && !disabled && !loading
          ? () => {
              scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
            }
          : undefined
      }
      onMouseLeave={
        Platform.OS === "web" && !disabled && !loading
          ? () => {
              scale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }
          : undefined
      }
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#0B0B0F" : "#A78BFA"}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`${textSizeClasses[size]} ${textVariantClasses[variant]}`}
            style={textStyle}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );

  return buttonContent;
};
