import { GradientBackground } from "@/components/GradientBackground";
import { Header } from "@/components/Header";
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
  onAuthStateChange,
} from "@/services/supabase";
import { Image as ExpoImage } from "expo-image";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
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

  // Listen to auth state changes (e.g., when user logs in via magic link)
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((user) => {
      if (user) {
        // User logged in, refresh saved movies
        loadSaved();
      } else {
        // User logged out, clear saved movies
        setSaved([]);
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSaved]);

  // Refresh user state when page comes into focus (e.g., after login)
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure auth state is updated
      const timer = setTimeout(() => {
        loadSaved();
      }, 100);
      return () => clearTimeout(timer);
    }, [loadSaved])
  );

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

  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

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

    const cardWidthPercent = isDesktop
      ? 100 / numColumns - 2
      : isTablet
      ? 100 / numColumns - 3
      : 100 / numColumns - 4;

    return (
      <View
        style={{
          width: `${cardWidthPercent}%`,
          marginBottom: 20,
        }}
      >
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
        >
          <Link href={`/movie/${item.movie_id}`} asChild>
            <Pressable>
              <View className="relative rounded-xl overflow-hidden mb-2">
                <ExpoImage
                  source={{ uri: item.poster_url }}
                  className="w-full rounded-xl"
                  style={{ aspectRatio: 2 / 3, minHeight: 240 }}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUnsave(item.$id, item.title);
                  }}
                  className="absolute top-2 right-2 bg-black/70 backdrop-blur-md p-2.5 rounded-full"
                  activeOpacity={0.8}
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    elevation: 6,
                  }}
                >
                  <Image
                    source={icons.saved}
                    style={{ width: 20, height: 20 }}
                    tintColor="#8B5CF6"
                  />
                </TouchableOpacity>
              </View>
            </Pressable>
          </Link>
          <Text
            className="text-text-primary text-sm font-semibold mt-1"
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
        <GradientBackground />
        <View className="px-6 pt-6">
          <Header />
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

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <GradientBackground />
      <View className="flex-1">
        {/* Header */}
        <Header />

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
                onPress={() => router.push("/")}
                variant="primary"
                size="lg"
              />
            }
          />
        ) : (
          <View className="flex-1">
            <FlatList
              data={saved}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => <PosterCard item={item} />}
              numColumns={numColumns}
              columnWrapperStyle={
                numColumns > 1
                  ? {
                      justifyContent: "flex-start",
                      paddingHorizontal: 24,
                      gap: isDesktop ? 20 : isTablet ? 16 : 12,
                    }
                  : undefined
              }
              contentContainerStyle={{
                paddingBottom: 120,
                paddingTop: 8,
                paddingHorizontal:
                  numColumns === 2 || numColumns === 3 || numColumns === 4
                    ? 0
                    : 24,
              }}
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
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SavedTab;
