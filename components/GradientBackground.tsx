import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

export const GradientBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#0f0818", "#1a0f2e", "#12081f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute",
    top: -80,
    left: "15%",
    width: "70%",
    height: 180,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderRadius: 9999,
  },
  glowBottom: {
    position: "absolute",
    bottom: 100,
    right: -60,
    width: 240,
    height: 240,
    backgroundColor: "rgba(167, 139, 250, 0.08)",
    borderRadius: 9999,
  },
});
