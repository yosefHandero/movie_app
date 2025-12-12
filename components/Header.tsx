import { Logo } from "@/components/Logo";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const blurStyle = {
    backgroundColor:
      Platform.OS === "web"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }),
  };

  return (
    <SafeAreaView edges={["top"]} className={className}>
      {Platform.OS === "web" ? (
        <View
          style={[
            blurStyle,
            {
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Logo size="medium" />
        </View>
      ) : (
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Logo size="medium" />
        </BlurView>
      )}
    </SafeAreaView>
  );
};

export default Header;
