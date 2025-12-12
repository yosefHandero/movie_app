import { GradientBackground } from "@/components/GradientBackground";
import { Header } from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { icons } from "@/constants/icons";
import {
  getCurrentUser,
  getSavedMovies,
  loginWithOTP,
  logout,
  onAuthStateChange,
  sendMagicLink,
} from "@/services/supabase";
import { BlurView } from "expo-blur";
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  // Listen to auth state changes (e.g., when user logs in via OTP code)
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (user) => {
      if (user) {
        setUserEmail(user.email || null);
        await loadSavedMoviesCount();
      } else {
        setUserEmail(null);
        setSavedMoviesCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendMagicLink(email);
      setSuccessMessage(
        "Verification code sent! Check your email and paste the 6-digit code below."
      );
      setShowOtpInput(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      console.error("Error sending verification code:", errorMessage);

      // User-friendly error messages
      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many")
      ) {
        setError("Too many requests. Please wait a moment and try again.");
      } else if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("format")
      ) {
        setError("Invalid email address. Please check and try again.");
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (otp.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginWithOTP(email, otp);
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email || null);
        setEmail("");
        setOtp("");
        setShowOtpInput(false);
        setSuccessMessage(null);
        setError(null);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to log in";
      console.error("Error logging in:", errorMessage);

      // User-friendly error messages
      if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("expired")
      ) {
        setError("Invalid or expired code. Please request a new one.");
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to verify code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setUserEmail(null);
      setEmail("");
      setOtp("");
      setShowOtpInput(false);
      setError(null);
      setSuccessMessage(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to log out";
      console.error("Error logging out:", errorMessage);
      setError("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
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
        <GradientBackground />
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
            <Header />

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
            <View className="items-center mb-6">
              <Card
                variant="elevated"
                className="p-8 overflow-hidden max-w-md w-full"
              >
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
                  <Text className="text-text-primary text-2xl font-bold mb-2 text-center">
                    Welcome back!
                  </Text>
                  <Text className="text-text-secondary text-base text-center mb-1">
                    {userEmail}
                  </Text>
                </View>

                {/* Stats Row */}
                <View className="flex-row justify-around pt-6 border-t border-border-primary">
                  <View className="items-center">
                    <Text className="text-accent-primary text-3xl font-bold mb-1 text-center">
                      {savedMoviesCount}
                    </Text>
                    <Text className="text-text-tertiary text-sm text-center">
                      Saved Movies
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-accent-primary text-3xl font-bold mb-1 text-center">
                      {savedMoviesCount > 0 ? "🎬" : "⭐"}
                    </Text>
                    <Text className="text-text-tertiary text-sm text-center">
                      Watchlist
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Quick Actions */}
            <View className="mb-6 items-center">
              <Text className="text-text-primary text-xl font-bold mb-4 text-center">
                Quick Actions
              </Text>
              <View className="flex-row gap-4 max-w-md w-full">
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
            <View className="items-center mb-6">
              <Card variant="elevated" className="p-6 max-w-md w-full">
                <Text className="text-text-primary text-lg font-bold mb-4 text-center">
                  Account
                </Text>
                <View className="mb-4 items-center">
                  <Text className="text-text-tertiary text-xs mb-1 text-center">
                    Email
                  </Text>
                  <Text className="text-text-primary text-base text-center">
                    {userEmail}
                  </Text>
                </View>
                <View className="items-center mt-2">
                  <Button
                    title="Logout"
                    onPress={handleLogout}
                    variant="outline"
                    size="lg"
                    className="max-w-xs w-full"
                  />
                </View>
              </Card>
            </View>

            {/* Info Card */}
            <View className="items-center">
              <Card variant="outlined" className="p-6 max-w-md w-full">
                <Text className="text-text-primary text-lg font-bold mb-3 text-center">
                  About
                </Text>
                <Text className="text-text-tertiary text-sm leading-6 mb-4 text-center">
                  Save your favorite movies to your watchlist and access them
                  anytime. Your data is securely stored and synced across all
                  your devices.
                </Text>
                <View className="flex-row items-center justify-center gap-2 mt-2">
                  <Image
                    source={icons.star}
                    className="w-4 h-4"
                    tintColor="#8B5CF6"
                  />
                  <Text className="text-text-tertiary text-xs text-center">
                    Premium movie discovery experience
                  </Text>
                </View>
              </Card>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show OTP input if magic link was sent
  if (showOtpInput) {
    const glassyCardStyle = {
      backgroundColor:
        Platform.OS === "web"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 0.1)",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      ...(Platform.OS === "web" && {
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }),
    };

    return (
      <SafeAreaView className="flex-1 " edges={["top"]}>
        <GradientBackground />
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
              <Header />

              <View className="items-center">
                {Platform.OS === "web" ? (
                  <View
                    style={[
                      glassyCardStyle,
                      { padding: 32, maxWidth: 400, width: "100%" },
                    ]}
                  >
                    <View className="items-center mb-5">
                      <View className="w-14 h-14 rounded-full bg-accent-primary/20 items-center justify-center mb-3">
                        <Image
                          source={icons.person}
                          className="w-8 h-8"
                          tintColor="#8B5CF6"
                        />
                      </View>
                      <Text className="text-text-primary text-lg font-bold mb-1.5">
                        Enter Verification Code
                      </Text>
                      <Text className="text-text-tertiary text-xs text-center">
                        Check your email for the OTP code
                      </Text>
                    </View>

                    <TextInput
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#71717A"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        setError(null);
                      }}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        fontSize: 18,
                        color: "#F4F4F5",
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: error
                          ? "rgba(239, 68, 68, 0.5)"
                          : "rgba(255, 255, 255, 0.2)",
                        marginBottom: error ? 12 : 20,
                        width: "100%",
                      }}
                      maxLength={6}
                      autoFocus
                    />

                    {error && (
                      <View
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 12,
                          width: "100%",
                        }}
                      >
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          {error}
                        </Text>
                      </View>
                    )}

                    <Button
                      title={isLoading ? "Verifying..." : "Verify & Login"}
                      onPress={handleLogin}
                      disabled={isLoading || otp.length !== 6}
                      variant="primary"
                      size="lg"
                      className="mb-3"
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setShowOtpInput(false);
                        setOtp("");
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="items-center py-2"
                    >
                      <Text className="text-text-tertiary text-xs underline">
                        Back to email
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      padding: 32,
                      maxWidth: 400,
                      width: "100%",
                    }}
                  >
                    <View className="items-center mb-5">
                      <View className="w-14 h-14 rounded-full bg-accent-primary/20 items-center justify-center mb-3">
                        <Image
                          source={icons.person}
                          className="w-8 h-8"
                          tintColor="#8B5CF6"
                        />
                      </View>
                      <Text className="text-text-primary text-lg font-bold mb-1.5">
                        Enter Verification Code
                      </Text>
                      <Text className="text-text-tertiary text-xs text-center">
                        Check your email for the OTP code
                      </Text>
                    </View>

                    <TextInput
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#71717A"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        setError(null);
                      }}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        fontSize: 18,
                        color: "#F4F4F5",
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: error
                          ? "rgba(239, 68, 68, 0.5)"
                          : "rgba(255, 255, 255, 0.2)",
                        marginBottom: error ? 12 : 20,
                        width: "100%",
                      }}
                      maxLength={6}
                      autoFocus
                    />

                    {error && (
                      <View
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 12,
                          width: "100%",
                        }}
                      >
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          {error}
                        </Text>
                      </View>
                    )}

                    <Button
                      title={isLoading ? "Verifying..." : "Verify & Login"}
                      onPress={handleLogin}
                      disabled={isLoading || otp.length !== 6}
                      variant="primary"
                      size="lg"
                      className="mb-3"
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setShowOtpInput(false);
                        setOtp("");
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="items-center py-2"
                    >
                      <Text className="text-text-tertiary text-xs underline">
                        Back to email
                      </Text>
                    </TouchableOpacity>
                  </BlurView>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Show email input
  const glassyCardStyle = {
    backgroundColor:
      Platform.OS === "web"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }),
  };

  return (
    <SafeAreaView className="flex-1 " edges={["top"]}>
      <GradientBackground />
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
            <Header />

            <View className="items-center">
              {Platform.OS === "web" ? (
                <View
                  style={[
                    glassyCardStyle,
                    { padding: 32, maxWidth: 400, width: "100%" },
                  ]}
                >
                  <View className="items-center mb-5">
                    <View className="w-14 h-14 rounded-full bg-accent-primary/20 items-center justify-center mb-3">
                      <Image
                        source={icons.person}
                        className="w-8 h-8"
                        tintColor="#8B5CF6"
                      />
                    </View>
                    <Text className="text-text-primary text-lg font-bold mb-1.5">
                      Get Started
                    </Text>
                    <Text className="text-text-tertiary text-xs text-center">
                      Enter your email to receive a verification code
                    </Text>
                  </View>

                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 16,
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#F4F4F5",
                      borderWidth: 1,
                      borderColor: error
                        ? "rgba(239, 68, 68, 0.5)"
                        : "rgba(255, 255, 255, 0.2)",
                      marginBottom: error || successMessage ? 12 : 20,
                      width: "100%",
                    }}
                    autoFocus
                  />

                  {error && (
                    <View
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: "#EF4444",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        {error}
                      </Text>
                    </View>
                  )}

                  {successMessage && (
                    <View
                      style={{
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: "#10B981",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        {successMessage}
                      </Text>
                    </View>
                  )}

                  <Button
                    title={isLoading ? "Sending..." : "Send Verification Code"}
                    onPress={handleSendMagicLink}
                    disabled={isLoading || !email.trim()}
                    variant="primary"
                    size="lg"
                    className="mb-3"
                  />

                  <Text className="text-text-tertiary text-xs text-center">
                    We'll send you a 6-digit code to your email. Paste it here
                    to sign in.
                  </Text>
                </View>
              ) : (
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    padding: 32,
                    maxWidth: 400,
                    width: "100%",
                  }}
                >
                  <View className="items-center mb-5">
                    <View className="w-14 h-14 rounded-full bg-accent-primary/20 items-center justify-center mb-3">
                      <Image
                        source={icons.person}
                        className="w-8 h-8"
                        tintColor="#8B5CF6"
                      />
                    </View>
                    <Text className="text-text-primary text-lg font-bold mb-1.5">
                      Get Started
                    </Text>
                    <Text className="text-text-tertiary text-xs text-center">
                      Enter your email to receive a verification code
                    </Text>
                  </View>

                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 16,
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#F4F4F5",
                      borderWidth: 1,
                      borderColor: error
                        ? "rgba(239, 68, 68, 0.5)"
                        : "rgba(255, 255, 255, 0.2)",
                      marginBottom: error || successMessage ? 12 : 20,
                      width: "100%",
                    }}
                    autoFocus
                  />

                  {error && (
                    <View
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: "#EF4444",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        {error}
                      </Text>
                    </View>
                  )}

                  {successMessage && (
                    <View
                      style={{
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: "#10B981",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        {successMessage}
                      </Text>
                    </View>
                  )}

                  <Button
                    title={isLoading ? "Sending..." : "Send Verification Code"}
                    onPress={handleSendMagicLink}
                    disabled={isLoading || !email.trim()}
                    variant="primary"
                    size="lg"
                    className="mb-3"
                  />

                  <Text className="text-text-tertiary text-xs text-center">
                    We'll send you a 6-digit code to your email. Paste it here
                    to sign in.
                  </Text>
                </BlurView>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;
