import { AwkwardMeterResult } from "@/utils/movieInsights";
import React from "react";
import { Text, View } from "react-native";
import { InfoTooltip } from "./InfoTooltip";

const toneColors: Record<AwkwardMeterResult["tone"], string> = {
  safe: "rgba(16, 185, 129, 0.35)",
  moderate: "rgba(167, 139, 250, 0.35)",
  caution: "rgba(239, 68, 68, 0.35)",
  unknown: "rgba(255, 255, 255, 0.12)",
};

const toneTextColors: Record<AwkwardMeterResult["tone"], string> = {
  safe: "#10B981",
  moderate: "#C4B5FD",
  caution: "#F87171",
  unknown: "#A1A1AA",
};

export interface AwkwardMeterProps {
  result: AwkwardMeterResult;
  compact?: boolean;
}

export const AwkwardMeter = React.memo<AwkwardMeterProps>(({
  result,
  compact = false,
}) => (
  <InfoTooltip
    label={
      <View
        style={{
          backgroundColor: "rgba(17, 17, 19, 0.9)",
          borderWidth: 1,
          borderColor: toneColors[result.tone],
          borderRadius: 9999,
          paddingHorizontal: compact ? 8 : 10,
          paddingVertical: compact ? 3 : 4,
        }}
      >
        <Text
          style={{
            color: toneTextColors[result.tone],
            fontSize: compact ? 10 : 12,
            fontWeight: "600",
          }}
        >
          {result.label}
        </Text>
      </View>
    }
    title="Watch Comfort"
    description={result.description}
  />
));
AwkwardMeter.displayName = "AwkwardMeter";
