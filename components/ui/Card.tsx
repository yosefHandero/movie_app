import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  className = '',
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

  const variantClasses = {
    default: 'bg-bg-tertiary',
    elevated: 'bg-bg-elevated shadow-lg shadow-black/20',
    outlined: 'bg-transparent border border-border-light',
  };

  const baseClasses = 'rounded-xl overflow-hidden transition-all';

  const Component = onPress ? AnimatedTouchable : AnimatedView;

  // Web hover effect
  const webHoverStyle = Platform.OS === 'web' && onPress ? {
    // @ts-ignore - web-only style
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  } : {};

  return (
    <Component
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={onPress ? 0.9 : 1}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={[animated && onPress ? animatedStyle : undefined, style, webHoverStyle]}
      // @ts-ignore - web-only props
      onMouseEnter={Platform.OS === 'web' && onPress ? () => {
        scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
        opacity.value = withTiming(0.95, { duration: 150 });
      } : undefined}
      onMouseLeave={Platform.OS === 'web' && onPress ? () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        opacity.value = withTiming(1, { duration: 150 });
      } : undefined}
    >
      {children}
    </Component>
  );
};

