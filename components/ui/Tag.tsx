import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface TagProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  label,
  onPress,
  selected = false,
  className = '',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const Component = onPress ? AnimatedTouchable : View;

  return (
    <Component
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={`
        px-3 py-1.5 rounded-full
        ${selected 
          ? 'bg-accent-primary' 
          : 'bg-bg-tertiary border border-border-light'
        }
        ${className}
      `}
      style={onPress ? animatedStyle : undefined}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-white' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>
    </Component>
  );
};

