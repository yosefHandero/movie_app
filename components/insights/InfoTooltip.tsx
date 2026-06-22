import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface InfoTooltipProps {
  label: React.ReactNode;
  description: string;
  title?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  label,
  description,
  title,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const [webHover, setWebHover] = useState(false);
  const opacity = useSharedValue(0);

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const showWebTooltip = () => {
    if (Platform.OS !== "web") return;
    setWebHover(true);
    opacity.value = withTiming(1, { duration: 150 });
  };

  const hideWebTooltip = () => {
    if (Platform.OS !== "web") return;
    setWebHover(false);
    opacity.value = withTiming(0, { duration: 120 });
  };

  const openModal = () => {
    if (Platform.OS === "web") return;
    setVisible(true);
  };

  const closeModal = () => setVisible(false);

  return (
    <View className={`relative self-start ${className}`} style={{ maxWidth: "100%" }}>
      <Pressable
        onPress={openModal}
        style={{ alignSelf: "flex-start", maxWidth: "100%" }}
        // @ts-ignore web-only
        onHoverIn={showWebTooltip}
        // @ts-ignore web-only
        onHoverOut={hideWebTooltip}
        accessibilityRole="button"
        accessibilityLabel={title || "More info"}
      >
        {label}
      </Pressable>

      {Platform.OS === "web" && webHover && (
        <Animated.View
          style={[
            tooltipStyle,
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
              shadowColor: "#A78BFA",
              shadowOpacity: 0.2,
              shadowRadius: 12,
            }}
          >
            {title ? (
              <Text className="text-accent-primary text-xs font-semibold mb-1">
                {title}
              </Text>
            ) : null}
            <Text className="text-text-secondary text-xs leading-4">
              {description}
            </Text>
          </View>
        </Animated.View>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center items-center px-8"
          onPress={closeModal}
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
                width: "100%",
              }}
            >
              <View className="p-5 bg-bg-tertiary/80">
                {title ? (
                  <Text className="text-accent-primary text-base font-bold mb-2">
                    {title}
                  </Text>
                ) : null}
                <Text className="text-text-secondary text-sm leading-5 mb-4">
                  {description}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
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
    </View>
  );
};
