import { icons } from "@/constants/icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
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
    overflow: "hidden",
    borderRadius: 9999,
  }));

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <AnimatedView
        style={animatedStyle}
        className={className}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 12,
            backgroundColor: "#0B0B0F",
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: isFocused
              ? "rgba(167, 139, 250, 0.7)"
              : "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Image
            source={icons.search}
            style={{ width: 18, height: 18, marginRight: 10 }}
            resizeMode="contain"
            tintColor="#A78BFA"
          />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={placeholder}
            placeholderTextColor="#71717A"
            style={{
              flex: 1,
              color: "#FFFFFF",
              fontSize: 15,
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
      </AnimatedView>
    </TouchableWithoutFeedback>
  );
};

export default SearchBar;
