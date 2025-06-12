// app/(tabs)/search.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";

import SearchBar from "@/components/SearchBar";
import MovieDisplayCard from "@/components/MovieCard";
import { Movie } from "@/interfaces/interfaces";
import useFetch from "@/services/useFetch";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const countedQueries = useRef<Set<string>>(new Set());

    // Memoize fetch callback so it only changes when searchQuery changes
    const fetchMoviesCallback = useCallback(
        () => fetchMovies({ query: searchQuery }),
        [searchQuery]
    );


    const {
        data: movies = [],
        loading,
        error,
        refetch: loadMovies,
    } = useFetch(fetchMoviesCallback);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                loadMovies();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchQuery, loadMovies]);

    // Only update search count once per unique query
    useEffect(() => {
        if (
            searchQuery.trim() &&
            movies.length > 0 &&
            !countedQueries.current.has(searchQuery)
        ) {
            countedQueries.current.add(searchQuery);
            updateSearchCount(searchQuery, movies[0]).catch((err) => {
                if (!/Rate limit/.test(err.message)) {
                    console.error("Failed to update search count:", err);
                }
            });
        }
    }, [searchQuery, movies]);

    // Only render movies when there's a query
    const dataToRender = searchQuery.trim() ? movies : [];

    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="flex-1 absolute w-full z-0"
                resizeMode="cover"
            />

            <FlatList
                className="px-5"
                data={dataToRender as Movie[]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <MovieDisplayCard {...item} />}
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: "flex-start",
                    gap: 16,
                    marginVertical: 16,
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image source={icons.logo} className="w-12 h-10" />
                        </View>
                        <View className="my-5">
                            <SearchBar
                                placeholder="Search for a movie"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        </View>
                        {loading && (
                            <ActivityIndicator size="large" color="#0000ff" className="my-3" />
                        )}
                        {error && (
                            <Text className="text-red-500 px-5 my-3">
                                {error.includes("Failed to fetch")
                                    ? "Network error: Unable to reach server."
                                    : `Error: ${error}`}
                            </Text>
                        )}
                        {searchQuery.trim() && movies.length > 0 && !loading && !error && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for <Text className="text-accent">{searchQuery}</Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-10 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim()
                                    ? "No movies found"
                                    : "Start typing to search for movies"}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Search;
