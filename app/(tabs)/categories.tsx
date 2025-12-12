import { CategoryPill } from "@/components/CategoryPill";
import { GradientBackground } from "@/components/GradientBackground";
import { Header } from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Genre } from "@/interfaces/interfaces";
import { fetchGenres, fetchMoviesByGenre } from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 768;
const isDesktop = SCREEN_WIDTH >= 1024;

const Categories = () => {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGenresCallback = useCallback(() => fetchGenres(), []);

  const {
    data: genres = [],
    loading: genresLoading,
    error: genresError,
    refetch: refetchGenres,
  } = useFetch(fetchGenresCallback);

  const fetchMoviesCallback = useCallback(() => {
    if (!selectedGenre) return Promise.resolve([]);
    return fetchMoviesByGenre(selectedGenre.id, 1);
  }, [selectedGenre]);

  const {
    data: movies = [],
    loading: moviesLoading,
    refetch: refetchMovies,
  } = useFetch(fetchMoviesCallback);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchGenres();
      if (selectedGenre) {
        await refetchMovies();
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refetchGenres, refetchMovies, selectedGenre]);

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
  };

  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  // Hide on large screens
  if (isDesktop) {
    return (
      <SafeAreaView className="flex-1" edges={["top"]}>
        <GradientBackground />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-primary text-xl font-bold text-center">
            Categories page is only available on smaller screens
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <GradientBackground />
      <View className="flex-1" style={{ maxWidth: "100%", width: "100%" }}>
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

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {/* Genres List */}
          <View className="px-6 mb-8">
            <Text className="text-text-primary text-3xl font-bold mb-6">
              Browse by Category
            </Text>
            <Text className="text-text-secondary text-base mb-4">
              Select a genre to discover movies
            </Text>

            {genresLoading ? (
              <View className="flex-row flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton
                    key={i}
                    width={100}
                    height={40}
                    borderRadius={20}
                    className="mr-3 mb-3"
                  />
                ))}
              </View>
            ) : genresError ? (
              <EmptyState
                title="Failed to load genres"
                message={genresError || "Please try again later"}
              />
            ) : (
              <View className="flex-row flex-wrap">
                {genres.map((genre: Genre) => (
                  <CategoryPill
                    key={genre.id}
                    label={genre.name}
                    onPress={() => handleGenreSelect(genre)}
                    isSelected={selectedGenre?.id === genre.id}
                    className="mr-3 mb-3"
                  />
                ))}
              </View>
            )}
          </View>

          {/* Movies for Selected Genre */}
          {selectedGenre && (
            <View className="px-6 pb-32">
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-text-primary text-2xl font-bold mb-1">
                    {selectedGenre.name} Movies
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {movies.length} {movies.length === 1 ? "movie" : "movies"}{" "}
                    found
                  </Text>
                </View>
              </View>

              {moviesLoading ? (
                <View className="flex-row flex-wrap gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      width={isDesktop ? "22%" : isTablet ? "30%" : "45%"}
                      height={280}
                      borderRadius={12}
                    />
                  ))}
                </View>
              ) : movies.length === 0 ? (
                <EmptyState
                  title="No movies found"
                  message={`We couldn't find any ${selectedGenre.name.toLowerCase()} movies`}
                />
              ) : (
                <FlatList
                  data={movies}
                  renderItem={({ item }) => (
                    <MovieCard
                      {...item}
                      size={isDesktop ? "medium" : "small"}
                      showRating={true}
                      className="mb-4"
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={numColumns}
                  columnWrapperStyle={
                    numColumns > 1
                      ? {
                          justifyContent: "flex-start",
                          gap: isDesktop ? 20 : 16,
                          marginBottom: isDesktop ? 20 : 16,
                        }
                      : undefined
                  }
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {/* Empty State when no genre selected */}
          {!selectedGenre && !genresLoading && genres.length > 0 && (
            <View className="px-6 pb-32">
              <EmptyState
                title="Select a category"
                message="Choose a genre above to start browsing movies"
              />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Categories;
