import { BlurView } from "expo-blur";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CategoryPillProps {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  onPress,
  isSelected = false,
  className = "",
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

  const blurStyle = {
    backgroundColor: isSelected
      ? Platform.OS === "web"
        ? "rgba(139, 92, 246, 0.7)"
        : "rgba(139, 92, 246, 0.7)"
      : Platform.OS === "web"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.1)",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: isSelected
      ? "rgba(139, 92, 246, 0.5)"
      : "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }),
  };

  if (Platform.OS === "web") {
    return (
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={animatedStyle}
        className={className}
      >
        <View style={blurStyle}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isSelected ? "#FFFFFF" : "#F4F4F5",
            }}
          >
            {label}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={animatedStyle}
      className={className}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{
          backgroundColor: isSelected
            ? "rgba(139, 92, 246, 0.7)"
            : "rgba(255, 255, 255, 0.1)",
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: isSelected
            ? "rgba(139, 92, 246, 0.5)"
            : "rgba(255, 255, 255, 0.2)",
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: isSelected ? "#FFFFFF" : "#F4F4F5",
          }}
        >
          {label}
        </Text>
      </BlurView>
    </AnimatedTouchable>
  );
};

export default CategoryPill;
