import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View, Pressable, Alert } from "react-native";
import { icons } from "@/constants/icons";
import { Movie } from "@/interfaces/interfaces";
import { useState, useEffect, useCallback } from "react";
import { saveMovie, getCurrentUser, getSavedMovies, deleteSavedMovie } from "@/services/appwrite";
import { router } from "expo-router";

const MovieCard = ({
                       id,
                       poster_path,
                       title,
                       vote_average,
                       release_date,
                   }: Movie) => {
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Function to check if the movie is already saved
    const checkSavedStatus = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                const savedMovies = await getSavedMovies();
                const saved = savedMovies.some(movie => movie.movie_id === id);
                setIsSaved(saved);
            }
        } catch (error) {
            console.error("Error checking saved status:", error);
        }
    }, [id]);

    // Load saved status on component mount
    useEffect(() => {
        checkSavedStatus();
    }, [checkSavedStatus]);

    const handleSaveMovie = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // Check if user is logged in
            const user = await getCurrentUser();
            if (!user) {
                Alert.alert(
                    "Login Required",
                    "You need to be logged in to save movies.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Login",
                            onPress: () => {
                                router.push('/(tabs)/profile');
                            }
                        }
                    ]
                );
                setLoading(false);
                return;
            }

            // Check current saved status
            const savedMovies = await getSavedMovies();
            const existingMovie = savedMovies.find(movie => movie.movie_id === id);

            if (existingMovie) {
                // Movie is already saved, so unsave it
                await deleteSavedMovie(existingMovie.$id);
                setIsSaved(false);
                Alert.alert("Success", "Movie removed from your collection!");
            } else {
                // Movie is not saved, so save it
                await saveMovie({
                    id,
                    title,
                    poster_path: poster_path ?? "",
                });
                setIsSaved(true);
                Alert.alert("Success", "Movie saved to your collection!");
            }
        } catch (error: any) {
            // Handle specific error cases
            if (error.message?.includes("already saved")) {
                setIsSaved(true);
                Alert.alert("Info", "Movie is already in your collection.");
            } else {
                Alert.alert("Error", error.message || "Failed to update save status.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="w-[30%]">
            <View className="relative">
                {/* Touchable link for full card (excluding save icon) */}
                <Link href={`/movie/${id}`} asChild>
                    <TouchableOpacity>
                        <Image
                            source={{
                                uri: poster_path
                                    ? `https://image.tmdb.org/t/p/w500${poster_path}`
                                    : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
                            }}
                            className="w-full h-52 rounded-lg"
                            resizeMode="cover"
                        />
                        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
                            {title}
                        </Text>
                    </TouchableOpacity>
                </Link>

                {/* Info row: rating/date on left, save icon on right */}
                <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row items-center gap-x-1">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-xs text-white font-bold uppercase">
                            {Math.round(vote_average / 2)}
                        </Text>
                        <Text className="text-xs text-light-300 font-medium">
                            {release_date?.split("-")[0]}
                        </Text>
                    </View>

                    <Pressable
                        onPress={handleSaveMovie}
                        className="p-1"
                        disabled={loading}
                    >
                        <Image
                            source={isSaved ? icons.saved : icons.save}
                            style={{ width: 16, height: 16 }}
                            tintColor={isSaved ? "#4B64E6" : undefined}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default MovieCard;