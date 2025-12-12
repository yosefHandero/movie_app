import { GradientBackground } from "@/components/GradientBackground";
import { supabase } from "@/services/supabase";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import "./global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    if (Platform.OS === "web") {
      // Handle auth redirects from magic links
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session error:", error);
        }
        if (session) {
          // Auth state listeners in components will handle the update
          // Clean up URL hash if present (from magic link redirect)
          if (typeof window !== "undefined" && window.location.hash) {
            // Remove auth tokens from URL after processing
            const url = new URL(window.location.href);
            url.hash = "";
            window.history.replaceState({}, "", url.toString());
          }
        }
      });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style="light" translucent={false} backgroundColor="#3C1B58" />
      <View style={{ flex: 1 }}>
        <GradientBackground />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "fade",
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="movie/[id]"
            options={{
              headerShown: false,
              presentation: "card",
              animation: "fade_from_bottom",
            }}
          />
        </Stack>
      </View>
    </>
  );
}
