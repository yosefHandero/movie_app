import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  className = '',
}) => {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View className={`flex-1 items-center justify-center px-6 py-16 ${className}`}>
      {icon && (
        <AnimatedView style={iconAnimatedStyle} className="mb-6">
          {icon}
        </AnimatedView>
      )}
      <Text className="text-text-primary text-2xl md:text-3xl font-bold text-center mb-3">
        {title}
      </Text>
      {message && (
        <Text className="text-text-tertiary text-base md:text-lg text-center mb-8 max-w-md leading-6">
          {message}
        </Text>
      )}
      {action && <View>{action}</View>}
    </View>
  );
};

