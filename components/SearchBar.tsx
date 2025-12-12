import { icons } from "@/constants/icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<Props> = ({
  placeholder,
  value,
  onChangeText,
  onPress,
  autoFocus = false,
  className = "",
}) => {
  const [input, setInput] = useState<string>(value);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(1);

  // Keep local input in sync if parent value changes
  useEffect(() => {
    setInput(value);
  }, [value]);

  // Debounce onChangeText calls - optimized to prevent unnecessary calls
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only debounce if input actually changed
    if (input !== value) {
      timeoutRef.current = setTimeout(() => {
        onChangeText(input);
      }, 500);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, onChangeText, value]);

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
      borderWidth.value = withTiming(2, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      borderWidth.value = withTiming(1, { duration: 200 });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
  }));

  const blurStyle = {
    backgroundColor:
      Platform.OS === "web"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.1)",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }),
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <AnimatedView
        style={[
          animatedStyle,
          {
            overflow: "hidden",
            borderRadius: 9999,
          },
        ]}
        className={className}
      >
        {Platform.OS === "web" ? (
          <View
            style={[
              blurStyle,
              {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 14,
              },
            ]}
          >
            <Image
              source={icons.search}
              style={{ width: 20, height: 20, marginRight: 12 }}
              resizeMode="contain"
              tintColor="#8B5CF6"
            />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={placeholder}
              placeholderTextColor="#71717A"
              style={{
                flex: 1,
                color: "#F4F4F5",
                fontSize: 16,
              }}
              editable={!onPress}
              autoFocus={autoFocus}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              accessibilityLabel="Search input"
              accessibilityHint="Enter movie title to search"
            />
          </View>
        ) : (
          <AnimatedBlurView
            intensity={20}
            tint="dark"
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: "rgba(139, 92, 246, 0.3)",
            }}
          >
            <Image
              source={icons.search}
              style={{ width: 20, height: 20, marginRight: 12 }}
              resizeMode="contain"
              tintColor="#8B5CF6"
            />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={placeholder}
              placeholderTextColor="#71717A"
              style={{
                flex: 1,
                color: "#F4F4F5",
                fontSize: 16,
              }}
              editable={!onPress}
              autoFocus={autoFocus}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              accessibilityLabel="Search input"
              accessibilityHint="Enter movie title to search"
            />
          </AnimatedBlurView>
        )}
      </AnimatedView>
    </TouchableWithoutFeedback>
  );
};

export default SearchBar;
