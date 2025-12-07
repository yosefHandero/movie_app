import CastCard from "@/components/CastCard";
import MovieCard from "@/components/MovieCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { icons } from "@/constants/icons";
import { MovieVideo } from "@/interfaces/interfaces";
import {
  fetchCollection,
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieVideos,
  fetchSimilarMovies,
} from "@/services/api";
import {
  getCurrentUser,
  getSavedMovies,
  toggleSaveMovie,
} from "@/services/supabase";
import useFetch from "@/services/useFetch";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
// Responsive hero height for web and mobile
const HERO_HEIGHT =
  Platform.OS === "web"
    ? Math.min(600, SCREEN_HEIGHT * 0.7)
    : Math.min(500, SCREEN_HEIGHT * 0.6);

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ label, value }) => (
  <View className="mb-4">
    <Text className="text-text-tertiary text-sm font-medium mb-1">{label}</Text>
    <Text className="text-text-primary text-base font-semibold">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const params = useLocalSearchParams();
  const idParam = params.id;
  const movieId = Array.isArray(idParam) ? idParam[0] : idParam;
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);

  const fetchMovieCallback = useCallback(() => {
    if (!movieId || isNaN(Number(movieId))) {
      return Promise.reject(new Error("Invalid movie ID"));
    }
    return fetchMovieDetails(movieId);
  }, [movieId]);

  const { data: movie, loading, error } = useFetch(fetchMovieCallback);

  // Fetch similar movies
  const fetchSimilarCallback = useCallback(() => {
    if (!movieId || isNaN(Number(movieId))) {
      return Promise.resolve([]);
    }
    return fetchSimilarMovies(movieId);
  }, [movieId]);

  const { data: similarMovies = [] } = useFetch(fetchSimilarCallback);

  // Fetch cast & crew
  const fetchCreditsCallback = useCallback(() => {
    if (!movieId || isNaN(Number(movieId))) {
      return Promise.resolve({ cast: [], crew: [] });
    }
    return fetchMovieCredits(movieId);
  }, [movieId]);

  const { data: credits = { cast: [], crew: [] } } =
    useFetch(fetchCreditsCallback);

  // Fetch videos (trailers)
  const fetchVideosCallback = useCallback(() => {
    if (!movieId || isNaN(Number(movieId))) {
      return Promise.resolve([]);
    }
    return fetchMovieVideos(movieId);
  }, [movieId]);

  const { data: videos = [] } = useFetch(fetchVideosCallback);

  // Fetch collection if movie belongs to one
  const collectionId = movie?.belongs_to_collection?.id;
  const fetchCollectionCallback = useCallback(() => {
    if (!movieId || isNaN(Number(movieId)) || !collectionId) {
      return Promise.resolve(null);
    }
    return fetchCollection(collectionId);
  }, [movieId, collectionId]);

  const { data: collection } = useFetch(fetchCollectionCallback);

  // Get main trailer (first official trailer, or first trailer)
  const mainTrailer =
    videos.find((v: MovieVideo) => v.official && v.type === "Trailer") ||
    videos[0];

  React.useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user && movie) {
          const savedMovies = await getSavedMovies();
          const saved = savedMovies.some((m) => m.movie_id === movie.id);
          setIsSaved(saved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    if (movie) {
      checkSavedStatus();
    }
  }, [movie]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const opacity = interpolate(
        event.contentOffset.y,
        [0, HERO_HEIGHT - 200],
        [0, 1],
        Extrapolate.CLAMP
      );
      headerOpacity.value = opacity;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolate.CLAMP
    );
    return { transform: [{ scale }] };
  });

  const handleSaveMovie = async () => {
    if (!movie || saving) return;
    setSaving(true);

    // Haptic feedback
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await toggleSaveMovie({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || "",
      });

      if (result.error) {
        if (result.error.includes("logged in")) {
          router.push("/(tabs)/profile");
        } else {
          // Could show error toast here
          console.error("Save error:", result.error);
        }
        return;
      }

      setIsSaved(result.isSaved);

      // Success haptic
      if (Platform.OS !== "web" && result.isSaved) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save movie";
      console.error("Error toggling save:", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleWatchTrailer = () => {
    if (mainTrailer) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${mainTrailer.key}`;
      Linking.openURL(youtubeUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 " edges={["top"]}>
        <View className="px-6 pt-6">
          <Skeleton
            width="100%"
            height={HERO_HEIGHT}
            borderRadius={0}
            className="mb-6"
          />
          <Skeleton width="60%" height={40} borderRadius={8} className="mb-4" />
          <Skeleton width="100%" height={100} borderRadius={8} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView className="flex-1 " edges={["top"]}>
        <View className="px-6">
          <TouchableOpacity
            onPress={router.back}
            className="mb-6 flex-row items-center"
          >
            <Image
              source={icons.arrow}
              className="w-6 h-6 mr-2"
              tintColor="#fff"
            />
            <Text className="text-text-primary text-base">Back</Text>
          </TouchableOpacity>
          <EmptyState
            title="Movie not found"
            message={error || "Failed to load movie details"}
          />
        </View>
      </SafeAreaView>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
    : "https://placehold.co/1280x720/1a1a1a/FFFFFF.png";

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://placehold.co/500x750/1a1a1a/FFFFFF.png";

  return (
    <View className="flex-1">
      {/* Animated Header */}
      <Animated.View
        style={headerAnimatedStyle}
        className="absolute top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between px-6 py-4">
            <TouchableOpacity
              onPress={router.back}
              className="flex-row items-center"
            >
              <Image
                source={icons.arrow}
                className="w-6 h-6 mr-2"
                tintColor="#fff"
              />
              <Text className="text-text-primary text-base font-medium">
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveMovie}
              disabled={saving}
              className="p-2"
            >
              <Image
                source={isSaved ? icons.saved : icons.save}
                className="w-6 h-6"
                tintColor={isSaved ? "#8B5CF6" : "#E4E4E7"}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Hero Section with Backdrop */}
        <View className="relative" style={{ height: HERO_HEIGHT }}>
          <AnimatedImage
            source={{ uri: backdropUrl }}
            className="absolute inset-0 w-full h-full"
            contentFit="cover"
            style={backdropAnimatedStyle}
            onLoad={() => setImageLoading(false)}
          />

          {/* Enhanced Gradient Overlay */}
          <View className="absolute inset-0 bg-black/10" />
          <View className="absolute bottom-0 left-0 right-0 h-3/4 bg-black/65" />

          {/* Content Overlay */}
          <SafeAreaView
            edges={["top"]}
            className="flex-1 justify-end px-6 pb-8"
          >
            <View className="flex-row items-end gap-6">
              {/* Poster - Enhanced */}
              <Animated.View
                className="w-32 h-48 md:w-40 md:h-60 rounded-xl overflow-hidden shadow-2xl"
                style={{
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <ExpoImage
                  source={{ uri: posterUrl }}
                  className="w-full h-full"
                  contentFit="cover"
                  transition={300}
                />
              </Animated.View>

              {/* Title and Info - Enhanced */}
              <View className="flex-1">
                <Text
                  className="text-white text-3xl md:text-4xl font-bold mb-3 leading-tight"
                  numberOfLines={2}
                >
                  {movie.title}
                </Text>
                <View className="flex-row items-center gap-3 mb-4 flex-wrap">
                  {movie.vote_average > 0 && (
                    <Badge
                      label={`${Math.round(movie.vote_average * 10) / 10}★`}
                      variant="accent"
                      size="md"
                    />
                  )}
                  {movie.release_date && (
                    <Text className="text-text-secondary text-base font-medium">
                      {movie.release_date.split("-")[0]}
                    </Text>
                  )}
                  {movie.runtime && (
                    <Text className="text-text-secondary text-base font-medium">
                      {movie.runtime}m
                    </Text>
                  )}
                </View>
                <View className="flex-row gap-2 flex-wrap mb-4">
                  {movie.genres?.slice(0, 4).map((genre: any) => (
                    <Tag key={genre.id} label={genre.name} />
                  ))}
                </View>
                {/* Quick Actions */}
                {mainTrailer && (
                  <View className="flex-row gap-3 mt-2">
                    <Button
                      title="Watch Trailer"
                      onPress={handleWatchTrailer}
                      variant="primary"
                      size="md"
                      icon={
                        <Image
                          source={icons.play}
                          className="w-4 h-4"
                          tintColor="#fff"
                        />
                      }
                    />
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Details Section */}
        <View className="px-6 pt-8 pb-32">
          {/* Action Buttons - Enhanced */}
          <View className="flex-row gap-3 mb-10">
            <Button
              title={isSaved ? "Saved to Watchlist" : "Add to Watchlist"}
              onPress={handleSaveMovie}
              variant={isSaved ? "secondary" : "primary"}
              size="lg"
              loading={saving}
              icon={
                <Image
                  source={isSaved ? icons.saved : icons.save}
                  className="w-5 h-5"
                  tintColor={isSaved ? "#8B5CF6" : "#fff"}
                />
              }
              className="flex-1"
            />
            {mainTrailer && (
              <Button
                title="Watch Trailer"
                onPress={handleWatchTrailer}
                variant="outline"
                size="lg"
                icon={
                  <Image
                    source={icons.play}
                    className="w-5 h-5"
                    tintColor="#8B5CF6"
                  />
                }
              />
            )}
            {movie.homepage && (
              <Button
                title="Website"
                onPress={() => Linking.openURL(movie.homepage!)}
                variant="outline"
                size="lg"
                icon={
                  <Image
                    source={icons.arrow}
                    className="w-5 h-5 rotate-[-45deg]"
                    tintColor="#8B5CF6"
                  />
                }
              />
            )}
          </View>

          {/* Overview - Enhanced */}
          {movie.overview && (
            <View className="mb-10">
              <Text className="text-text-primary text-2xl font-bold mb-4">
                Overview
              </Text>
              <Text className="text-text-secondary text-base md:text-lg leading-7 max-w-3xl">
                {movie.overview}
              </Text>
            </View>
          )}

          {/* Movie Info Grid - Enhanced */}
          <View className="mb-10">
            <Text className="text-text-primary text-2xl font-bold mb-6">
              Details
            </Text>
            <View className="flex-row flex-wrap gap-6">
              <View className="flex-1 min-w-[140px]">
                <MovieInfo
                  label="Release Date"
                  value={
                    movie.release_date
                      ? new Date(movie.release_date).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : null
                  }
                />
                <MovieInfo
                  label="Budget"
                  value={
                    movie.budget
                      ? `$${Math.round(movie.budget / 1_000_000)}M`
                      : null
                  }
                />
              </View>
              <View className="flex-1 min-w-[140px]">
                <MovieInfo
                  label="Runtime"
                  value={movie.runtime ? `${movie.runtime} min` : null}
                />
                <MovieInfo
                  label="Revenue"
                  value={
                    movie.revenue
                      ? `$${Math.round(movie.revenue / 1_000_000)}M`
                      : null
                  }
                />
              </View>
            </View>
          </View>

          {/* Genres - Enhanced */}
          {movie.genres && movie.genres.length > 0 && (
            <View className="mb-10">
              <Text className="text-text-primary text-2xl font-bold mb-4">
                Genres
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {movie.genres.map((genre: any) => (
                  <Tag key={genre.id} label={genre.name} />
                ))}
              </View>
            </View>
          )}

          {/* Production Companies - Enhanced */}
          {movie.production_companies &&
            movie.production_companies.length > 0 && (
              <View className="mb-10">
                <Text className="text-text-primary text-2xl font-bold mb-4">
                  Production Companies
                </Text>
                <Text className="text-text-secondary text-base md:text-lg leading-6">
                  {movie.production_companies
                    .map((c: any) => c.name)
                    .join(" • ")}
                </Text>
              </View>
            )}

          {/* Cast & Crew Section */}
          {credits.cast && credits.cast.length > 0 && (
            <View className="mb-10">
              <Text className="text-text-primary text-2xl font-bold mb-6">
                Cast
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={credits.cast.slice(0, 20)} // Show top 20 cast members
                renderItem={({ item }) => (
                  <CastCard cast={item} className="mr-4" />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingRight: 24 }}
              />
            </View>
          )}

          {/* Collection Section */}
          {collection && collection.parts && collection.parts.length > 0 && (
            <View className="mb-10">
              <Text className="text-text-primary text-2xl font-bold mb-2">
                {collection.name}
              </Text>
              {collection.overview && (
                <Text className="text-text-secondary text-sm mb-4">
                  {collection.overview}
                </Text>
              )}
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={collection.parts.filter(
                  (part: Movie) => part.id !== movie.id
                )}
                renderItem={({ item }) => (
                  <View className="mr-4" style={{ width: 140 }}>
                    <MovieCard {...item} size="small" showRating={true} />
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingRight: 24 }}
              />
            </View>
          )}

          {/* Similar Movies Section */}
          {similarMovies && similarMovies.length > 0 && (
            <View className="mb-10">
              <Text className="text-text-primary text-2xl font-bold mb-6">
                Similar Movies
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={similarMovies.slice(0, 10)} // Show top 10 similar movies
                renderItem={({ item }) => (
                  <View className="mr-4" style={{ width: 140 }}>
                    <MovieCard {...item} size="small" showRating={true} />
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingRight: 24 }}
              />
            </View>
          )}
        </View>
      </AnimatedScrollView>
    </View>
  );
};

export default MovieDetails;
