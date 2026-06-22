import { glassNavStyle } from "@/constants/glass";
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
  }, [isActive, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    ...(isActive
      ? { backgroundColor: "rgba(167, 139, 250, 0.2)" }
      : undefined),
  }));

  if (isActive) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        style={animatedStyle}
        className="flex-row items-center justify-center px-3 py-2 rounded-full"
      >
        <Image source={icon} className="w-5 h-5" tintColor="#A78BFA" />
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
      <Image source={icon} className="w-5 h-5" tintColor="#C4B5FD" />
      <Text className="text-xs font-medium mt-1" style={{ color: "#C4B5FD" }}>
        {title}
      </Text>
    </AnimatedTouchable>
  );
}

export const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: "Home", icon: icons.home, path: "/" as const },
    { name: "Search", icon: icons.search, path: "/(tabs)/search" as const },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return (
        pathname === "/" || pathname === "/(tabs)/" || pathname === "/(tabs)"
      );
    }
    return pathname === path;
  };

  const navContent = (
    <>
      {tabs.map((tab) => (
        <NavIcon
          key={tab.name}
          icon={tab.icon}
          title={tab.name}
          isActive={isActive(tab.path)}
          onPress={() => router.push(tab.path)}
        />
      ))}
    </>
  );

  const containerStyle = {
    position: "absolute" as const,
    bottom: Platform.OS === "web" ? 20 : Math.max(insets.bottom, 24),
    left: 16,
    right: 16,
    height: 66,
    zIndex: 1000,
    borderRadius: 18,
    overflow: "hidden" as const,
    ...glassNavStyle,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  };

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          containerStyle,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            paddingHorizontal: 12,
          },
        ]}
      >
        {navContent}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <BlurView
        intensity={50}
        tint="dark"
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: 12,
          backgroundColor: "rgba(34, 20, 56, 0.75)",
        }}
      >
        {navContent}
      </BlurView>
    </View>
  );
};

export default BottomNavBar;
