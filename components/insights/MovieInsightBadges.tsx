import {
  AwkwardMeterResult,
  MovieInsightInput,
  getAwkwardMeter,
  getVibeTags,
} from "@/utils/movieInsights";
import React, { useMemo } from "react";
import { View } from "react-native";
import { AwkwardMeter } from "./AwkwardMeter";
import { VibeTag } from "./VibeTag";

export interface MovieInsightBadgesProps {
  movie: MovieInsightInput;
  certification?: string | null;
  keywords?: string[];
  compact?: boolean;
  showAwkwardMeter?: boolean;
  awkwardMeter?: AwkwardMeterResult;
}

export const MovieInsightBadges = React.memo<MovieInsightBadgesProps>(({
  movie,
  certification,
  keywords,
  compact = false,
  showAwkwardMeter = true,
  awkwardMeter: awkwardMeterProp,
}) => {
  const vibeTags = useMemo(
    () => getVibeTags(movie, 3, keywords, certification),
    [movie, keywords, certification]
  );
  const awkwardMeter = useMemo(
    () =>
      awkwardMeterProp ??
      getAwkwardMeter(movie, certification, keywords),
    [movie, certification, keywords, awkwardMeterProp]
  );

  if (!vibeTags.length && !showAwkwardMeter) return null;

  return (
    <View className={`flex-row flex-wrap items-center ${compact ? "gap-1" : "gap-1.5"}`}>
      {vibeTags.map((tag) => (
        <VibeTag key={tag} tag={tag} compact={compact} />
      ))}
      {showAwkwardMeter && (
        <AwkwardMeter result={awkwardMeter} compact={compact} />
      )}
    </View>
  );
});
MovieInsightBadges.displayName = "MovieInsightBadges";
