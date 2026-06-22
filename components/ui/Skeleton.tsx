import React from "react";
import { View } from "react-native";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  variant?: "default" | "pulse";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
  variant = "default",
}) => {
  return (
    <View
      className={`bg-bg-tertiary ${className}`}
      style={
        {
          width,
          height,
          borderRadius,
          opacity: variant === "pulse" ? 0.45 : 0.32,
        } as any
      }
    />
  );
};
