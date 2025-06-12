import { useEffect, useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";
import { sendMagicLink, loginWithOTP, logout, getCurrentUser } from "@/services/appwrite";

const Profile = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        checkCurrentUser();
    }, []);

    const checkCurrentUser = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        } catch (error) {
            setUserEmail(null);
        }
    };

    const handleSendMagicLink = async () => {
        if (!email.trim()) {
            return Alert.alert("Error", "Please enter a valid email.");
        }

        setIsLoading(true);

        try {
            const response = await sendMagicLink(email);
            // Store userId for later use with OTP
            setUserId(response.userId);
            setShowOtpInput(true);
            Alert.alert(
                "OTP Sent!",
                "Check your email for the verification code."
            );
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send magic link.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!otp.trim()) {
            return Alert.alert("Error", "Please enter the OTP code.");
        }

        setIsLoading(true);

        try {
            await loginWithOTP(userId, otp);
            const user = await getCurrentUser();
            if (user) {
                setUserEmail(user.email);
                setEmail("");
                setOtp("");
                setShowOtpInput(false);
                Alert.alert("Success", "Logged in successfully!");
            }
        } catch (error: any) {
            Alert.alert("Error", "Invalid OTP code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUserEmail(null);
            setEmail("");
            setOtp("");
            setShowOtpInput(false);
            Alert.alert("Logged out", "You have been logged out.");
        } catch (err: any) {
            Alert.alert("Error", err.message || "Logout failed.");
        }
    };

    // If already logged in, show email + logout button
    if (userEmail) {
        return (
            <SafeAreaView className="bg-dark-200 flex-1 px-10">
                <View className="flex justify-center items-center flex-1 gap-5">
                    <Image source={icons.person} className="size-10" tintColor="#fff" />
                    <Text className="text-white text-base">You are logged in as</Text>
                    <Text className="text-accent text-lg font-bold text-white">{userEmail}</Text>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-600 rounded px-4 py-2 mt-4"
                    >
                        <Text className="text-white font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show OTP input if magic link was sent
    if (showOtpInput) {
        return (
            <SafeAreaView className="bg-dark-200 flex-1 px-10">
                <View className="flex justify-center items-center flex-1 gap-5">
                    <Image source={icons.person} className="size-10" tintColor="#fff" />
                    <Text className="text-gray-500 text-base">
                        Enter your OTP verification code here
                    </Text>

                    <TextInput
                        placeholder="Enter OTP"
                        placeholderTextColor="#888"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        className="bg-dark-100 text-white w-3/4 p-3 rounded text-center"
                        maxLength={6}
                    />

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`bg-primary rounded px-4 py-2 mt-4 ${isLoading ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-white font-semibold">
                            {isLoading ? "Verifying..." : "Login"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setShowOtpInput(false);
                            setOtp("");
                        }}
                        className="mt-2"
                    >
                        <Text className="text-gray-400 text-sm underline">
                            Back to email
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Otherwise, show email input and send magic link
    return (
        <SafeAreaView className="bg-dark-200 flex-1 px-10">
            <View className="flex justify-center items-center flex-1 gap-5">
                <Image source={icons.person} className="size-10" tintColor="#fff" />
                <Text className="text-gray-500 text-base">
                    Enter your email to receive a magic link
                </Text>

                <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-dark-100 text-white w-3/4 p-3 rounded"
                />



                <TouchableOpacity
                    onPress={handleSendMagicLink}
                    disabled={isLoading}
                    className={`bg-accent rounded px-4 py-2 ${isLoading ? 'opacity-50' : ''}`}
                >
                    <Text className="text-white font-semibold">
                        {isLoading ? "Sending..." : "Send Magic Link"}
                    </Text>
                </TouchableOpacity>

                <Text className="text-gray-400 text-xs text-center mt-4 px-8">
                    We&#39;ll send you a login code to your email. No password needed!
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default Profile;