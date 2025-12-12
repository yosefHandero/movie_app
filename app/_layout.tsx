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
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Auth state listeners in components will handle the update
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
