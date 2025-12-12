import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Image, Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

function TabIcon({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: number | { uri: string };
  title: string;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(focused ? 1 : 0.6);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withSpring(focused ? 1 : 0.6, {
      duration: 200,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (focused) {
    return (
      <AnimatedView
        className="flex-row items-center justify-center px-4 py-2 rounded-full bg-accent-primary"
        style={animatedStyle}
      >
        <Image source={icon} className="w-5 h-5" tintColor="#FFFFFF" />
        <Text className="text-white text-sm font-semibold ml-2">{title}</Text>
      </AnimatedView>
    );
  }

  return (
    <AnimatedView className="items-center justify-center" style={animatedStyle}>
      <Image source={icon} className="w-5 h-5" tintColor="#E4E4E7" />
      <Text className="text-xs font-medium mt-1" style={{ color: "#E4E4E7" }}>
        {title}
      </Text>
    </AnimatedView>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor:
            Platform.OS === "web"
              ? "rgba(165, 165, 169, 0.7)"
              : "rgba(165, 165, 169, 0.85)", // Semi-transparent for glass effect
          borderRadius: 24,
          marginHorizontal: 20,
          marginBottom: Platform.OS === "web" ? 20 : 24,
          height: 76, // Increased height to accommodate text
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.3)", // Light border for glass effect
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 12,
          // Web-specific backdrop blur
          ...(Platform.OS === "web" && {
            // @ts-ignore - web-only CSS
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Saved" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tab bar - only accessible on smaller screens
        }}
      />
    </Tabs>
  );
}
