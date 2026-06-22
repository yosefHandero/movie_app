import React from "react";
import { Text, View } from "react-native";
import { InfoTooltip } from "./InfoTooltip";

export interface SkipIfProps {
  text: string;
  compact?: boolean;
}

export const SkipIf = React.memo<SkipIfProps>(({ text, compact = false }) => (
  <InfoTooltip
    label={
      <View
        style={{
          backgroundColor: "rgba(17, 17, 19, 0.75)",
          borderWidth: 1,
          borderColor: "rgba(245, 158, 11, 0.25)",
          borderRadius: 10,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 6 : 8,
          alignSelf: "flex-start",
          maxWidth: compact ? 220 : 280,
        }}
      >
        <Text
          className={`text-warning font-semibold ${
            compact ? "text-[10px] mb-0.5" : "text-xs mb-1"
          }`}
        >
          Skip If…
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
    title="Skip If…"
    description="A cautious heads-up based on genre, tone, and runtime — helps you decide faster."
  />
));
SkipIf.displayName = "SkipIf";
