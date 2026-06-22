import { MovieLogo } from "@/components/MovieLogo";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  className?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  className = "",
  subtitle = "Discover your next watch",
}) => {
  return (
    <SafeAreaView edges={["top"]} className={className}>
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(26, 15, 46, 0.85)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(167, 139, 250, 0.18)",
        }}
      >
        <MovieLogo size="medium" />
        {subtitle ? (
          <Text className="text-text-tertiary text-xs mt-1 tracking-wide">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default Header;
