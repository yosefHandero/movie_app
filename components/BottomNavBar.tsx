import { icons } from "@/constants/icons";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function NavIcon({
  icon,
  title,
  isActive,
  onPress,
}: {
  icon: number | { uri: string };
  title: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isActive ? 1 : 0.6);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withSpring(isActive ? 1 : 0.6, {
      duration: 200,
    });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (isActive) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        style={animatedStyle}
        className="flex-row items-center justify-center px-4 py-2 rounded-full bg-accent-primary"
      >
        <Image source={icon} className="w-5 h-5" tintColor="#FFFFFF" />
        <Text className="text-white text-sm font-semibold ml-2">{title}</Text>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      className="items-center justify-center"
      style={animatedStyle}
    >
      <Image source={icon} className="w-5 h-5" tintColor="#E4E4E7" />
      <Text className="text-xs font-medium mt-1" style={{ color: "#E4E4E7" }}>
        {title}
      </Text>
    </AnimatedTouchable>
  );
}

export const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const blurStyle = {
    backgroundColor:
      Platform.OS === "web"
        ? "rgba(165, 165, 169, 0.7)"
        : "rgba(165, 165, 169, 0.85)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }),
  };

  const tabs = [
    { name: "Home", icon: icons.home, path: "/" as const },
    { name: "Search", icon: icons.search, path: "/(tabs)/search" as const },
    { name: "Saved", icon: icons.save, path: "/(tabs)/saved" as const },
    { name: "Profile", icon: icons.person, path: "/(tabs)/profile" as const },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return (
        pathname === "/" || pathname === "/(tabs)/" || pathname === "/(tabs)"
      );
    }
    return pathname === path;
  };

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          blurStyle,
          {
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            height: 76,
            zIndex: 1000,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            paddingHorizontal: 12,
            shadowColor: "#8B5CF6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          },
        ]}
      >
        {tabs.map((tab) => (
          <NavIcon
            key={tab.name}
            icon={tab.icon}
            title={tab.name}
            isActive={isActive(tab.path)}
            onPress={() => router.push(tab.path)}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: Math.max(insets.bottom, 24),
        left: 20,
        right: 20,
        height: 76,
        zIndex: 1000,
      }}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{
          backgroundColor: "rgba(165, 165, 169, 0.85)",
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: 12,
          height: "100%",
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        {tabs.map((tab) => (
          <NavIcon
            key={tab.name}
            icon={tab.icon}
            title={tab.name}
            isActive={isActive(tab.path)}
            onPress={() => router.push(tab.path)}
          />
        ))}
      </BlurView>
    </View>
  );
};

export default BottomNavBar;
