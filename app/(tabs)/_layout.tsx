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
  icon: any;
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
      <Image source={icon} className="w-5 h-5" tintColor="#A1A1AA" />
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
          backgroundColor: "#89898D", // 50% lighter background
          borderRadius: 24,
          marginHorizontal: 20,
          marginBottom: Platform.OS === "web" ? 20 : 24,
          height: 68,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(139, 92, 246, 0.2)",
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 12,
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
        name="categories"
        options={{
          href: null, // Hide categories tab - merged into search
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
        name="register"
        options={{
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}
