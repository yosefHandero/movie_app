import {Account, Client, Databases, ID, Query } from "react-native-appwrite";
import {Movie, SavedMovie, TrendingMovie} from "@/interfaces/interfaces";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_MOVIE_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIE_ID!;
const USER_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USER_ID!;


const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
export const account = new Account(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal("searchTerm", query),
        ]);

        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1,
                }
            );
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                title: movie.title,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error("Error updating search count:", error);
        throw error;
    }
};

export const getTrendingMovies = async (): Promise<
    TrendingMovie[] | undefined
> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count"),
        ]);

        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
export const saveMovie = async (movie: {
    id: number;
    title: string;
    poster_path: string;
}) => {
    try {
        // Get current user from Auth
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("You must be logged in to save movies");
        }

        const poster_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        // Check if this user already saved this movie
        const existing = await database.listDocuments(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, [
            Query.equal("movie_id", movie.id),
            Query.equal("user_id", user.$id), // Use Auth user ID
        ]);

        if (existing.total > 0) {
            throw new Error("Movie already saved");
        }

        // Save movie with user_id
        await database.createDocument(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, ID.unique(), {
            movie_id: movie.id,
            title: movie.title,
            poster_url,
            user_id: user.$id, // Link to Auth user ID
        });

        console.log("Movie saved!");
    } catch (err) {
        console.error("Error saving movie:", err);
        throw err;
    }
};

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
    try {
        // Get current user from Auth
        const user = await getCurrentUser();
        if (!user) {
            console.log("User not logged in, returning empty saved movies");
            return [];
        }

        // Get only movies saved by this user
        const result = await database.listDocuments(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, [
            Query.equal("user_id", user.$id), // Filter by Auth user ID
            Query.orderDesc("$createdAt"),
        ]);

        return result.documents as unknown as SavedMovie[];
    } catch (error) {
        console.error("Error fetching saved movies:", error);
        return [];
    }
};

export const sendMagicLink = async (email: string) => {
    try {

        const token = await account.createEmailToken(ID.unique(), email);
        return token;
    } catch (error) {
        console.error("Send magic link error:", error);
        throw error;
    }
};

export const loginWithOTP = async (userId: string, secret: string) => {
    try {
        // Create session using the userId and secret (OTP)
        const session = await account.createSession(userId, secret);
        return session;
    } catch (error) {
        console.error("Login with OTP error:", error);
        throw error;
    }
};
export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (error: any) {
        if (error.code !== 401 && error.type !== 'general_unauthorized_scope') {
            console.error("Get current user error:", error);
        }
        return null;
    }
};
export const deleteSavedMovie = async (documentId: string) => {
    try {
        await database.deleteDocument(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, documentId);
        console.log("Deleted saved movie:", documentId);
    } catch (error) {
        console.error("Error deleting movie:", error);
        throw error;
    }
};
export const toggleSaveMovie = async (movie: {
    id: number;
    title: string;
    poster_path: string;
}): Promise<{ isSaved: boolean; error?: string }> => {
    try {
        // Get current user from Auth
        const user = await getCurrentUser();
        if (!user) {
            return { isSaved: false, error: "You must be logged in to save movies" };
        }

        const poster_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        // Check if this user already saved this movie
        const existing = await database.listDocuments(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, [
            Query.equal("movie_id", movie.id),
            Query.equal("user_id", user.$id),
        ]);

        if (existing.total > 0) {
            // Movie is already saved, so unsave it
            const documentId = existing.documents[0].$id;
            await database.deleteDocument(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, documentId);
            console.log("Movie unsaved:", movie.id);
            return { isSaved: false };
        } else {
            // Movie is not saved, so save it
            await database.createDocument(DATABASE_ID, SAVED_MOVIE_COLLECTION_ID, ID.unique(), {
                movie_id: movie.id,
                title: movie.title,
                poster_url,
                user_id: user.$id,
            });
            console.log("Movie saved:", movie.id);
            return { isSaved: true };
        }
    } catch (err: any) {
        console.error("Error toggling save movie:", err);
        return { isSaved: false, error: err.message || "Failed to toggle save status" };
    }
};