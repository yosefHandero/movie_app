import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, View } from "react-native";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "medium",
  className = "",
}) => {
  const sizeMap = {
    small: { container: 40, mark: 24, stroke: 2 },
    medium: { container: 56, mark: 36, stroke: 2.5 },
    large: { container: 72, mark: 48, stroke: 3 },
  };

  const dimensions = sizeMap[size];

  return (
    <View
      className={`items-center justify-center ${className}`}
      style={{ width: dimensions.container, height: dimensions.container }}
    >
      {/* Modern Geometric Mark - Clean Design */}
      <View
        style={{
          width: dimensions.mark,
          height: dimensions.mark,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Main geometric shape with gradient */}
        <LinearGradient
          colors={["#8B5CF6", "#A78BFA", "#C4B5FD", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: dimensions.mark,
            height: dimensions.mark,
            borderRadius: dimensions.mark * 0.25,
            position: "absolute",
            transform: [{ rotate: "45deg" }],
          }}
        />

        {/* Inner geometric shape for depth */}
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: dimensions.mark * 0.6,
            height: dimensions.mark * 0.6,
            borderRadius: dimensions.mark * 0.15,
            position: "absolute",
            transform: [{ rotate: "-45deg" }],
          }}
        />

        {/* Center circle accent */}
        <View
          style={{
            width: dimensions.mark * 0.25,
            height: dimensions.mark * 0.25,
            borderRadius: dimensions.mark * 0.125,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            position: "absolute",
          }}
        />

        {/* Subtle glow effect */}
        {Platform.OS === "web" && (
          <View
            style={{
              position: "absolute",
              width: dimensions.mark,
              height: dimensions.mark,
              borderRadius: dimensions.mark * 0.25,
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
            }}
          />
        )}
      </View>
    </View>
  );
};

export default Logo;
