import { Platform, ViewStyle } from "react-native";

export const glass = {
  background: "rgba(26, 15, 46, 0.72)",
  backgroundStrong: "rgba(34, 20, 56, 0.88)",
  border: "rgba(167, 139, 250, 0.22)",
  borderStrong: "rgba(167, 139, 250, 0.35)",
  blur: Platform.OS === "web" ? 0 : 40,
} as const;

export const glassCardStyle: ViewStyle = {
  backgroundColor: glass.background,
  borderWidth: 1,
  borderColor: glass.border,
  ...(Platform.OS === "web"
    ? {
        // @ts-ignore web-only
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }
    : {}),
};

export const glassNavStyle: ViewStyle = {
  backgroundColor: glass.backgroundStrong,
  borderWidth: 1,
  borderColor: glass.border,
  ...(Platform.OS === "web"
    ? {
        // @ts-ignore web-only
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(139, 92, 246, 0.15)",
      }
    : {}),
};
