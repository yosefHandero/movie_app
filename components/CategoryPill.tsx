import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CategoryPillProps {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
  description?: string;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  onPress,
  isSelected = false,
  description,
  className = "",
}) => {
  const scale = useSharedValue(1);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [webHover, setWebHover] = useState(false);
  const tooltipOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const webTooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const showWebTooltip = () => {
    if (!description || Platform.OS !== "web") return;
    setWebHover(true);
    tooltipOpacity.value = withTiming(1, { duration: 150 });
  };

  const hideWebTooltip = () => {
    if (Platform.OS !== "web") return;
    setWebHover(false);
    tooltipOpacity.value = withTiming(0, { duration: 120 });
  };

  const pillStyle = {
    backgroundColor: isSelected ? "#A78BFA" : "rgba(12, 12, 16, 0.9)",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: isSelected
      ? "rgba(167, 139, 250, 0.85)"
      : "rgba(167, 139, 250, 0.18)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: isSelected ? "#A78BFA" : "#000",
    shadowOpacity: isSelected ? 0.25 : 0.1,
    shadowRadius: isSelected ? 10 : 4,
    shadowOffset: { width: 0, height: 2 },
  };

  return (
    <View className={`relative ${className}`}>
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        onLongPress={
          description ? () => setTooltipVisible(true) : undefined
        }
        style={animatedStyle}
        activeOpacity={0.9}
        // @ts-ignore web-only
        onHoverIn={showWebTooltip}
        // @ts-ignore web-only
        onHoverOut={hideWebTooltip}
      >
        <View style={pillStyle}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isSelected ? "#0B0B0F" : "#F4F4F5",
            }}
          >
            {label}
          </Text>
        </View>
      </AnimatedTouchable>

      {description && Platform.OS === "web" && webHover && (
        <Animated.View
          style={[
            webTooltipStyle,
            {
              position: "absolute",
              bottom: "100%",
              left: 0,
              marginBottom: 6,
              zIndex: 50,
              minWidth: 160,
              maxWidth: 240,
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={{
              backgroundColor: "rgba(12, 12, 16, 0.95)",
              borderWidth: 1,
              borderColor: "rgba(167, 139, 250, 0.28)",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text className="text-accent-primary text-xs font-semibold mb-1">
              {label}
            </Text>
            <Text className="text-text-secondary text-xs leading-4">
              {description}
            </Text>
          </View>
        </Animated.View>
      )}

      {description && (
        <Modal
          visible={tooltipVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTooltipVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/60 justify-center items-center px-8"
            onPress={() => setTooltipVisible(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <BlurView
                intensity={40}
                tint="dark"
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(167, 139, 250, 0.3)",
                  maxWidth: 320,
                }}
              >
                <View className="p-5 bg-bg-tertiary/80">
                  <Text className="text-accent-primary text-base font-bold mb-2">
                    {label}
                  </Text>
                  <Text className="text-text-secondary text-sm leading-5 mb-4">
                    {description}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTooltipVisible(false)}
                    className="self-end px-4 py-2 rounded-full bg-accent-primary/20 border border-accent-primary/40"
                  >
                    <Text className="text-accent-primary text-sm font-semibold">
                      Got it
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default CategoryPill;
