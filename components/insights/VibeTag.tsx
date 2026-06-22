import { getVibeTagDescription } from "@/utils/movieInsights";
import React from "react";
import { Text, View } from "react-native";
import { InfoTooltip } from "./InfoTooltip";

export interface VibeTagProps {
  tag: string;
  compact?: boolean;
}

export const VibeTag = React.memo<VibeTagProps>(({ tag, compact = false }) => (
  <InfoTooltip
    label={
      <View
        style={{
          backgroundColor: "rgba(17, 17, 19, 0.9)",
          borderWidth: 1,
          borderColor: "rgba(167, 139, 250, 0.22)",
          borderRadius: 9999,
          paddingHorizontal: compact ? 8 : 10,
          paddingVertical: compact ? 3 : 4,
        }}
      >
        <Text
          className={`text-accent-tertiary font-medium ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {tag}
        </Text>
      </View>
    }
    title={tag}
    description={getVibeTagDescription(tag)}
  />
));
VibeTag.displayName = "VibeTag";
