import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchMovieDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { icons } from "@/constants/icons";

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-sm text-light-200 font-normal">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">
            {value || 'N/A'}
        </Text>
    </View>
);

const MovieDetails = () => {
    const params = useLocalSearchParams();
    const idParam = params.id;
    const movieId = Array.isArray(idParam) ? idParam[0] : idParam;

    // Memoize the fetch function to prevent unnecessary re-creation
    const fetchMovieCallback = useCallback(() => {
        if (!movieId || isNaN(Number(movieId))) {
            console.warn('Invalid movie ID:', movieId);
            return Promise.reject(new Error('Invalid movie ID'));
        }
        return fetchMovieDetails(movieId);
    }, [movieId]);

    const { data: movie, loading, error } = useFetch(fetchMovieCallback);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-dark-200">
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-white mt-4">Loading...</Text>
            </View>
        );
    }

    if (error || !movie) {
        return (
            <View className="flex-1 justify-center items-center bg-dark-200">
                <Text className="text-white">Movie not found or failed to load.</Text>
                {error && <Text className="text-red-500 mt-2">{error}</Text>}
            </View>
        );
    }

    return (
        <View className="bg-dark-200 flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View>
                    <Image
                        source={{
                            uri: movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : 'https://placehold.co/600x400/1a1a1a/ff5ff.png',
                        }}
                        className="w-full h-[550px] mt-10"
                    />
                </View>
                <View className="flex-col items-start justify-center ml-5 mt-5 pt-5">
                    <Text className="text-white font-bold text-xl">{movie?.title}</Text>
                    <View className="flex-row items-center gap-x-1 mt-2">
                        <Text className="text-light-200 text-sm">{movie?.release_date?.split('-')[0]}</Text>
                        <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
                    </View>
                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-white font-bold text-sm">{Math.round(movie?.vote_average ?? 0)}/10 </Text>
                        <Text className="text-light-200 text-sm">({movie?.vote_count} votes)</Text>
                    </View>
                    <MovieInfo label="Overview" value={movie?.overview} />
                    <MovieInfo
                        label="Genres"
                        value={movie?.genres?.map((g: any) => g.name).join(' - ') || 'N/A'} />
                    <View className="flex flex-row justify-between w-1/2">
                        <MovieInfo
                            label="Budget"
                            value={
                                movie?.budget
                                    ? `$${Math.round(movie.budget / 1_000_000)} million`
                                    : 'N/A'
                            }
                        />
                        <MovieInfo
                            label="Revenue"
                            value={
                                movie?.revenue
                                    ? `$${Math.round(movie.revenue / 1_000_000)} million`
                                    : 'N/A'
                            }
                        />
                    </View>
                    <MovieInfo
                        label="Production Companies"
                        value={movie?.production_companies.map((c: any) => c.name).join(' - ') || 'N/A'} />
                </View>
            </ScrollView>
            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-purple-700 rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Image source={icons.arrow} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff" />
                <Text className="text-white">Go back</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MovieDetails;