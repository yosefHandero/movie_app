import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { icons } from "@/constants/icons";
import { SavedMovie } from "@/interfaces/interfaces";
import {
  deleteSavedMovie,
  getCurrentUser,
  getSavedMovies,
} from "@/services/supabase";
import { Image as ExpoImage } from "expo-image";
import { Link, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SavedTab = () => {
  const [saved, setSaved] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadSaved = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();
      setIsLoggedIn(!!user);

      if (user) {
        const movies = await getSavedMovies();
        setSaved(movies);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load saved movies";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  }, [loadSaved]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleUnsave = async (docId: string, title: string): Promise<void> => {
    try {
      await deleteSavedMovie(docId);
      setSaved((prev) => prev.filter((m) => m.$id !== docId));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete movie";
      console.error("Error deleting movie:", errorMessage);
    }
  };

  const PosterCard = ({ item }: { item: SavedMovie }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const cardWidth = isDesktop ? "22%" : isTablet ? "30%" : "45%";

    return (
      <View className={`${cardWidth} mb-6`}>
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
        >
          <Link href={`/movie/${item.movie_id}`} asChild>
            <Pressable>
              <View className="relative rounded-xl overflow-hidden">
                <ExpoImage
                  source={{ uri: item.poster_url }}
                  className="w-full h-64 rounded-xl"
                  contentFit="cover"
                />
                <AnimatedPressable
                  onPress={() => handleUnsave(item.$id, item.title)}
                  className="absolute top-2 right-2 bg-bg-elevated/90 backdrop-blur-sm p-2 rounded-full"
                >
                  <Image
                    source={icons.saved}
                    style={{ width: 18, height: 18 }}
                    tintColor="#8B5CF6"
                  />
                </AnimatedPressable>
              </View>
            </Pressable>
          </Link>
          <Text
            className="text-text-primary text-sm font-semibold mt-2"
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </AnimatedPressable>
      </View>
    );
  };

  if (!isLoggedIn && !loading) {
    return (
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-center mb-8">
            <ExpoImage
              source={icons.logo}
              className="w-12 h-10"
              contentFit="contain"
            />
          </View>
          <EmptyState
            icon={
              <Image
                source={icons.person}
                className="w-20 h-20"
                tintColor="#71717A"
              />
            }
            title="Login Required"
            message="You need to be logged in to see your saved movies"
            action={
              <Button
                title="Go to Login"
                onPress={() => router.push("/(tabs)/profile")}
                variant="primary"
                size="lg"
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-center">
          <ExpoImage
            source={icons.logo}
            className="w-14 h-12"
            contentFit="contain"
          />
        </View>

        {/* Search Bar - Centered and Shorter */}
        <View className="px-6 mb-4 items-center">
          <View className="w-full max-w-sm">
            <SearchBar
              placeholder="Search for a movie..."
              value=""
              onChangeText={() => {
                router.push("/(tabs)/search");
              }}
              onPress={() => router.push("/(tabs)/search")}
            />
          </View>
        </View>

        {loading && !refreshing ? (
          <View className="px-6">
            <View className="flex-row flex-wrap gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  width={isDesktop ? "22%" : isTablet ? "30%" : "45%"}
                  height={320}
                  borderRadius={12}
                />
              ))}
            </View>
          </View>
        ) : error ? (
          <View className="px-6 py-12">
            <EmptyState title="Error" message={error} />
          </View>
        ) : saved.length === 0 && isLoggedIn ? (
          <EmptyState
            icon={
              <Image
                source={icons.save}
                className="w-20 h-20"
                tintColor="#71717A"
              />
            }
            title="No saved movies yet"
            message="Start saving your favorite movies to watch them later"
            action={
              <Button
                title="Browse Movies"
                onPress={() => router.push("/(tabs)/")}
                variant="primary"
                size="lg"
              />
            }
          />
        ) : (
          <FlatList
            data={saved}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => <PosterCard item={item} />}
            numColumns={numColumns}
            columnWrapperStyle={
              numColumns > 1
                ? {
                    justifyContent: "flex-start",
                    gap: isDesktop ? 20 : 16,
                    paddingHorizontal: 24,
                    marginBottom: isDesktop ? 20 : 16,
                  }
                : undefined
            }
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8B5CF6"
                colors={["#8B5CF6"]}
              />
            }
            ListHeaderComponent={
              saved.length > 0 ? (
                <View className="px-6 mb-6">
                  <Text className="text-text-primary text-3xl font-bold mb-2">
                    My Watchlist
                  </Text>
                  <Text className="text-text-secondary text-base">
                    {saved.length} {saved.length === 1 ? "movie" : "movies"}{" "}
                    saved
                  </Text>
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SavedTab;
