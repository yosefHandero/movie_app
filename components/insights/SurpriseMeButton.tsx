import { Movie } from "@/interfaces/interfaces";
import {
  getSkipIf,
  getWhyWatch,
  pickSurpriseMovie,
} from "@/utils/movieInsights";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
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
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MovieInsightBadges } from "./MovieInsightBadges";
import { SkipIf } from "./SkipIf";
import { WhyWatchThis } from "./WhyWatchThis";

export interface SurpriseMovieModalProps {
  visible: boolean;
  movie: Movie | null;
  onClose: () => void;
}

export const SurpriseMovieModal: React.FC<SurpriseMovieModalProps> = ({
  visible,
  movie,
  onClose,
}) => {
  const router = useRouter();
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 16, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      scale.value = 0.92;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const insights = useMemo(() => {
    if (!movie) return null;
    return {
      whyWatch: getWhyWatch(movie),
      skipIf: getSkipIf(movie),
    };
  }, [movie]);

  if (!movie) return null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://placehold.co/500x750/1a1a1a/FFFFFF.png";

  const handleViewDetails = () => {
    onClose();
    router.push(`/movie/${movie.id}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/70 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View style={cardStyle}>
            <BlurView
              intensity={45}
              tint="dark"
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(167, 139, 250, 0.35)",
                maxWidth: 380,
                width: "100%",
                shadowColor: "#A78BFA",
                shadowOpacity: 0.35,
                shadowRadius: 24,
              }}
            >
              <View className="bg-bg-secondary/90 p-5">
                <Text className="text-accent-primary text-sm font-bold uppercase tracking-wider mb-3">
                  Surprise Pick
                </Text>

                <View className="flex-row gap-4">
                  <Image
                    source={{ uri: posterUrl }}
                    style={{
                      width: 100,
                      height: 150,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(167, 139, 250, 0.25)",
                    }}
                    contentFit="cover"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-text-primary text-lg font-bold mb-2"
                      numberOfLines={2}
                    >
                      {movie.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mb-2">
                      {movie.release_date ? (
                        <Text className="text-text-tertiary text-sm">
                          {movie.release_date.split("-")[0]}
                        </Text>
                      ) : null}
                      {movie.vote_average > 0 && (
                        <Badge
                          label={`${Math.round(movie.vote_average * 10) / 10}/10`}
                          variant="accent"
                          size="sm"
                        />
                      )}
                    </View>
                    <MovieInsightBadges movie={movie} compact />
                  </View>
                </View>

                {insights && (
                  <View className="mt-4 gap-2">
                    <WhyWatchThis text={insights.whyWatch} compact />
                    <SkipIf text={insights.skipIf} compact />
                  </View>
                )}

                <View className="flex-row gap-3 mt-5">
                  <Button
                    title="View Details"
                    onPress={handleViewDetails}
                    variant="primary"
                    size="md"
                    className="flex-1"
                  />
                  <TouchableOpacity
                    onPress={onClose}
                    className="px-4 py-3 rounded-xl border border-border-light"
                  >
                    <Text className="text-text-secondary font-semibold">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export interface SurpriseMeButtonProps {
  movies: Movie[];
  className?: string;
}

export const SurpriseMeButton: React.FC<SurpriseMeButtonProps> = ({
  movies,
  className = "",
}) => {
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState<Movie | null>(null);

  const handleSurprise = async () => {
    const pick = pickSurpriseMovie(movies);
    if (!pick) return;

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelected(pick);
    setVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleSurprise}
        activeOpacity={0.85}
        className={className}
        style={{
          backgroundColor: "rgba(17, 17, 19, 0.9)",
          borderWidth: 1,
          borderColor: "rgba(167, 139, 250, 0.35)",
          borderRadius: 9999,
          paddingHorizontal: 16,
          paddingVertical: 10,
          shadowColor: "#A78BFA",
          shadowOpacity: 0.25,
          shadowRadius: 12,
        }}
      >
        <Text className="text-accent-primary text-sm font-bold">
          Surprise Me
        </Text>
      </TouchableOpacity>

      <SurpriseMovieModal
        visible={visible}
        movie={selected}
        onClose={() => setVisible(false)}
      />
    </>
  );
};
