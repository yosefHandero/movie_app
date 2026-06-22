import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Image, Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    ...(focused
      ? { backgroundColor: "rgba(167, 139, 250, 0.16)" }
      : undefined),
  }));

  if (focused) {
    return (
      <AnimatedView
        className="flex-row items-center justify-center px-3 py-2 rounded-full"
        style={animatedStyle}
      >
        <Image source={icon} className="w-5 h-5" tintColor="#A78BFA" />
        <Text className="text-sm font-semibold ml-2" style={{ color: "#FFFFFF" }}>
          {title}
        </Text>
      </AnimatedView>
    );
  }

  return (
    <AnimatedView className="items-center justify-center" style={animatedStyle}>
      <Image source={icon} className="w-5 h-5" tintColor="#A1A1AA" />
      <Text className="text-xs font-medium mt-1" style={{ color: "#A1A1AA" }}>
        {title}
      </Text>
    </AnimatedView>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
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
          backgroundColor: "rgba(34, 20, 56, 0.88)",
          borderRadius: 18,
          height: 66,
          position: "absolute",
          bottom: Platform.OS === "web" ? 20 : Math.max(insets.bottom, 24),
          left: 20,
          right: 20,
          zIndex: 1000,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(167, 139, 250, 0.22)",
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
          pointerEvents: "box-none",
          ...(Platform.OS === "web"
            ? {
                // @ts-ignore web-only
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }
            : {}),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
