import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    Image,
    FlatList,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";

import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";
import useFetch from "@/services/useFetch";

const Index = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const fetchMoviesCallback = useCallback(() => fetchMovies({ query: "" }), []);
    const trendingMoviesCallback = useCallback(() => getTrendingMovies(), []);

    const {
        data: trendingMovies,
        loading: trendingLoading,
        error: trendingError,
        refetch: refetchTrending,
    } = useFetch(trendingMoviesCallback);

    const {
        data: movies,
        loading: moviesLoading,
        error: moviesError,
        refetch: refetchMovies,
    } = useFetch(fetchMoviesCallback);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            console.log("Starting refresh...");
            await Promise.all([refetchTrending(), refetchMovies()]);
            console.log("Refresh completed.");
        } catch (err) {
            console.error("Refresh failed:", err);
        } finally {
            setRefreshing(false);
            console.log("Refreshing state reset.");
        }
    }, [refetchTrending, refetchMovies]);

    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />

            <ScrollView
                className="flex-1 px-5 mt-10"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ffffff"
                        colors={["#4B64E6"]}
                        title=""
                        titleColor="#ffffff"
                    />
                }
            >
                <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

                {(moviesLoading || trendingLoading) && !refreshing ? (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        className="mt-10 self-center"
                    />
                ) : moviesError || trendingError ? (
                    <Text className="text-red-500">
                        Error: {moviesError || trendingError || "Something went wrong"}
                    </Text>
                ) : (
                    <View className="flex-1 mt-5">
                        <SearchBar
                            onPress={() => {
                                router.push("/search");
                            }}
                            placeholder="Search for a movie"
                            value={""}
                            onChangeText={() => {}}
                        />

                        {trendingMovies && (
                            <View className="mt-10">
                                <Text className="text-lg text-white font-bold mb-3">
                                    Trending Movies
                                </Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4 mt-3"
                                    data={trendingMovies}
                                    contentContainerStyle={{
                                        gap: 26,
                                    }}
                                    renderItem={({ item, index }) => (
                                        <TrendingCard movie={item} index={index} />
                                    )}
                                    keyExtractor={(item) => item.movie_id.toString()}
                                    ItemSeparatorComponent={() => <View className="w-4" />}
                                />
                            </View>
                        )}

                        <>
                            <Text className="text-lg text-white font-bold mt-5 mb-3">
                                Latest Movies
                            </Text>

                            <FlatList
                                data={movies}
                                renderItem={({ item }) => <MovieCard {...item} />}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={3}
                                columnWrapperStyle={{
                                    justifyContent: "flex-start",
                                    gap: 20,
                                    paddingRight: 5,
                                    marginBottom: 10,
                                }}
                                className="mt-2 pb-32"
                                scrollEnabled={false}
                            />
                        </>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Index;