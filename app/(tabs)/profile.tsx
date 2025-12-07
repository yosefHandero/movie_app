import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { icons } from "@/constants/icons";
import {
  getCurrentUser,
  getSavedMovies,
  loginWithOTP,
  logout,
  sendMagicLink,
} from "@/services/supabase";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Profile = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [savedMoviesCount, setSavedMoviesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  useEffect(() => {
    if (userEmail) {
      loadSavedMoviesCount();
    }
  }, [userEmail]);

  const checkCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email || null);
      } else {
        setUserEmail(null);
        setSavedMoviesCount(0);
      }
    } catch (error) {
      setUserEmail(null);
      setSavedMoviesCount(0);
    }
  };

  const loadSavedMoviesCount = async () => {
    try {
      const movies = await getSavedMovies();
      setSavedMoviesCount(movies.length);
    } catch (error) {
      setSavedMoviesCount(0);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([checkCurrentUser(), loadSavedMoviesCount()]);
    setRefreshing(false);
  }, []);

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Could show error toast here
      console.error("Invalid email format");
      return;
    }

    setIsLoading(true);

    try {
      await sendMagicLink(email);
      setShowOtpInput(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send magic link";
      console.error("Error sending magic link:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      await loginWithOTP(email, otp);
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email || null);
        setEmail("");
        setOtp("");
        setShowOtpInput(false);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to log in";
      console.error("Error logging in:", errorMessage);
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
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to log out";
      console.error("Error logging out:", errorMessage);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // If already logged in, show profile
  if (userEmail) {
    return (
      <SafeAreaView className="flex-1 " edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          <View className="px-6 pt-8 pb-8">
            {/* Header */}
            <View className="items-center mb-6">
              <Image
                source={icons.logo}
                className="w-16 h-14 mb-4"
                contentFit="contain"
              />
            </View>

            {/* Search Bar - Centered and Shorter */}
            <View className="px-6 mb-6 items-center">
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

            {/* Profile Header Card */}
            <Card variant="elevated" className="p-8 mb-6 overflow-hidden">
              <View className="items-center mb-6">
                {/* Avatar with gradient background */}
                <View
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 items-center justify-center mb-4 shadow-lg"
                  style={{
                    backgroundColor: "#8B5CF6",
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text className="text-white text-3xl font-bold">
                    {getUserInitials(userEmail)}
                  </Text>
                </View>
                <Text className="text-text-primary text-2xl font-bold mb-2">
                  Welcome back!
                </Text>
                <Text className="text-text-secondary text-base text-center mb-1">
                  {userEmail}
                </Text>
              </View>

              {/* Stats Row */}
              <View className="flex-row justify-around pt-6 border-t border-border-primary">
                <View className="items-center">
                  <Text className="text-accent-primary text-3xl font-bold mb-1">
                    {savedMoviesCount}
                  </Text>
                  <Text className="text-text-tertiary text-sm">
                    Saved Movies
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-accent-primary text-3xl font-bold mb-1">
                    {savedMoviesCount > 0 ? "🎬" : "⭐"}
                  </Text>
                  <Text className="text-text-tertiary text-sm">Watchlist</Text>
                </View>
              </View>
            </Card>

            {/* Quick Actions */}
            <View className="mb-6">
              <Text className="text-text-primary text-xl font-bold mb-4">
                Quick Actions
              </Text>
              <View className="flex-row gap-4">
                <AnimatedTouchable
                  onPress={() => router.push("/(tabs)/saved")}
                  className="flex-1"
                >
                  <Card variant="elevated" className="p-4 items-center">
                    <View className="w-12 h-12 rounded-full bg-accent-primary/20 items-center justify-center mb-2">
                      <Image
                        source={icons.saved}
                        className="w-6 h-6"
                        tintColor="#8B5CF6"
                      />
                    </View>
                    <Text className="text-text-primary text-sm font-semibold text-center">
                      My Watchlist
                    </Text>
                  </Card>
                </AnimatedTouchable>
                <AnimatedTouchable
                  onPress={() => router.push("/(tabs)/search")}
                  className="flex-1"
                >
                  <Card variant="elevated" className="p-4 items-center">
                    <View className="w-12 h-12 rounded-full bg-accent-primary/20 items-center justify-center mb-2">
                      <Image
                        source={icons.search}
                        className="w-6 h-6"
                        tintColor="#8B5CF6"
                      />
                    </View>
                    <Text className="text-text-primary text-sm font-semibold text-center">
                      Discover
                    </Text>
                  </Card>
                </AnimatedTouchable>
              </View>
            </View>

            {/* Account Section */}
            <Card variant="outlined" className="p-6 mb-6">
              <Text className="text-text-primary text-lg font-bold mb-4">
                Account
              </Text>
              <View className="mb-4">
                <Text className="text-text-tertiary text-xs mb-1">Email</Text>
                <Text className="text-text-primary text-base">{userEmail}</Text>
              </View>
              <Button
                title="Logout"
                onPress={handleLogout}
                variant="outline"
                size="lg"
                className="mt-2"
              />
            </Card>

            {/* Info Card */}
            <Card variant="outlined" className="p-6">
              <Text className="text-text-primary text-lg font-bold mb-3">
                About
              </Text>
              <Text className="text-text-tertiary text-sm leading-6 mb-4">
                Save your favorite movies to your watchlist and access them
                anytime. Your data is securely stored and synced across all your
                devices.
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <Image
                  source={icons.star}
                  className="w-4 h-4"
                  tintColor="#8B5CF6"
                />
                <Text className="text-text-tertiary text-xs">
                  Premium movie discovery experience
                </Text>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show OTP input if magic link was sent
  if (showOtpInput) {
    return (
      <SafeAreaView className="flex-1 " edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6">
              <View className="items-center mb-8">
                <Image
                  source={icons.logo}
                  className="w-16 h-14 mb-4"
                  contentFit="contain"
                />
              </View>

              <Card variant="elevated" className="p-6">
                <View className="items-center mb-6">
                  <View className="w-16 h-16 rounded-full bg-accent-primary/20 items-center justify-center mb-4">
                    <Image
                      source={icons.person}
                      className="w-10 h-10"
                      tintColor="#8B5CF6"
                    />
                  </View>
                  <Text className="text-text-primary text-xl font-bold mb-2">
                    Enter Verification Code
                  </Text>
                  <Text className="text-text-tertiary text-sm text-center">
                    Check your email for the OTP code
                  </Text>
                </View>

                <TextInput
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#71717A"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  className="bg-bg-tertiary text-text-primary w-full p-4 rounded-xl text-center text-lg mb-4 border border-border-light"
                  maxLength={6}
                  autoFocus
                />

                <Button
                  title={isLoading ? "Verifying..." : "Verify & Login"}
                  onPress={handleLogin}
                  disabled={isLoading || otp.length !== 6}
                  variant="primary"
                  size="lg"
                  className="mb-4"
                />

                <TouchableOpacity
                  onPress={() => {
                    setShowOtpInput(false);
                    setOtp("");
                  }}
                  className="items-center py-2"
                >
                  <Text className="text-text-tertiary text-sm underline">
                    Back to email
                  </Text>
                </TouchableOpacity>
              </Card>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Show email input
  return (
    <SafeAreaView className="flex-1 " edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            <View className="items-center mb-8">
              <Image
                source={icons.logo}
                className="w-16 h-14 mb-4"
                contentFit="contain"
              />
              <Text className="text-text-primary text-2xl font-bold mb-2">
                Welcome
              </Text>
              <Text className="text-text-tertiary text-base text-center">
                Sign in to save your favorite movies
              </Text>
            </View>

            <Card variant="elevated" className="p-6">
              <View className="items-center mb-6">
                <View className="w-16 h-16 rounded-full bg-accent-primary/20 items-center justify-center mb-4">
                  <Image
                    source={icons.person}
                    className="w-10 h-10"
                    tintColor="#8B5CF6"
                  />
                </View>
                <Text className="text-text-primary text-xl font-bold mb-2">
                  Get Started
                </Text>
                <Text className="text-text-tertiary text-sm text-center">
                  Enter your email to receive a magic link
                </Text>
              </View>

              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#71717A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="bg-bg-tertiary text-text-primary w-full p-4 rounded-xl mb-4 border border-border-light"
                autoFocus
              />

              <Button
                title={isLoading ? "Sending..." : "Send Magic Link"}
                onPress={handleSendMagicLink}
                disabled={isLoading || !email.trim()}
                variant="primary"
                size="lg"
                className="mb-4"
              />

              <Text className="text-text-tertiary text-xs text-center px-4">
                We'll send you a login code to your email. No password needed!
              </Text>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;
