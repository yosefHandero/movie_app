import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, ActivityIndicator, Text, Image, Pressable, Alert, RefreshControl } from "react-native";
import { Link, router } from "expo-router";
import { icons } from "@/constants/icons";
import { getSavedMovies, deleteSavedMovie, getCurrentUser } from "@/services/appwrite";
import { SavedMovie } from "@/interfaces/interfaces";
import { TouchableOpacity } from "react-native";

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
        } catch (err: any) {
            setError(err.message ?? "Failed to load saved movies");
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
        Alert.alert(
            "Remove Saved Movie",
            `Are you sure you want to remove "${title}" from your saved movies?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteSavedMovie(docId);
                            setSaved((prev) => prev.filter((m) => m.$id !== docId));
                        } catch (error: any) {
                            Alert.alert(
                                "Error",
                                error.message || "Failed to remove movie. Please try again."
                            );
                        }
                    }
                }
            ]
        );
    };

    const PosterCard = ({ item }: { item: SavedMovie }) => (
        <View className="w-[30%] mt-10">
            <Link href={`/movie/${item.movie_id}`} asChild>
                <Pressable>
                    <Image
                        source={{ uri: item.poster_url }}
                        className="w-full h-52 rounded-lg"
                        resizeMode="cover"
                    />
                    <Text className="text-xs text-white mt-1" numberOfLines={1}>
                        {item.title}
                    </Text>
                </Pressable>
            </Link>

            <Pressable
                onPress={() => handleUnsave(item.$id, item.title)}
                className="absolute top-2 right-2 bg-dark-100 p-1 rounded"
            >
                <Image source={icons.saved} style={{ width: 16, height: 16 }} />
            </Pressable>
        </View>
    );

    if (!isLoggedIn && !loading) {
        return (
            <View className="flex-1 bg-dark-200 p-5 justify-center items-center">
                <Image source={icons.person} className="w-20 h-20 mb-4" tintColor="#666" />
                <Text className="text-white text-lg font-semibold mb-2">Login Required</Text>
                <Text className="text-gray-400 text-center mb-6">
                    You need to be logged in to see your saved movies
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/profile')}
                    className="bg-primary px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-dark-200 p-5">
            {loading && !refreshing && <ActivityIndicator size="large" color="#4B64E6" className="mt-10" />}

            {error && (
                <Text className="text-red-500 text-center mt-10">
                    {error}
                </Text>
            )}

            {!loading && !error && saved.length === 0 && isLoggedIn && (
                <Text className="text-gray-400 text-center mt-20">
                    You haven&#39;t saved any movies yet.
                </Text>
            )}

            <FlatList
                data={saved}
                keyExtractor={(item) => item.$id}
                renderItem={PosterCard}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "flex-start", gap: 16, marginVertical: 16 }}
                contentContainerStyle={{ paddingBottom: 100 }}
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
            />
        </View>
    );
};

export default SavedTab;