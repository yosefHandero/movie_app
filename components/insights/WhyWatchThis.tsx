import React from "react";
import { Text, View } from "react-native";
import { InfoTooltip } from "./InfoTooltip";

export interface WhyWatchThisProps {
  text: string;
  compact?: boolean;
}

export const WhyWatchThis = React.memo<WhyWatchThisProps>(({
  text,
  compact = false,
}) => (
  <InfoTooltip
    label={
      <View
        style={{
          backgroundColor: "rgba(17, 17, 19, 0.75)",
          borderWidth: 1,
          borderColor: "rgba(167, 139, 250, 0.18)",
          borderRadius: 10,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 6 : 8,
          alignSelf: "flex-start",
          maxWidth: compact ? 220 : 280,
        }}
      >
        <Text
          className={`text-accent-primary font-semibold ${
            compact ? "text-[10px] mb-0.5" : "text-xs mb-1"
          }`}
        >
          Why Watch This?
        </Text>
        <Text
          className={`text-text-secondary leading-4 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
          numberOfLines={compact ? 2 : 3}
        >
          {text}
        </Text>
      </View>
    }
    title="Why Watch This?"
    description="A quick reason to watch, based on genre, rating, and overview — not hard facts."
  />
));
WhyWatchThis.displayName = "WhyWatchThis";
