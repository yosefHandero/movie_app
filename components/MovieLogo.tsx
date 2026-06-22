import { icons } from "@/constants/icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type MovieLogoSize = "small" | "medium" | "large";

interface MovieLogoProps {
  size?: MovieLogoSize;
  showWordmark?: boolean;
  className?: string;
  style?: ViewStyle;
}

const sizeMap = {
  small: { scale: 0.58, fontSize: 14 },
  medium: { scale: 0.82, fontSize: 18 },
  large: { scale: 1, fontSize: 22 },
};

export const MovieLogo: React.FC<MovieLogoProps> = React.memo(
  ({ size = "medium", showWordmark = false, className = "", style }) => {
    const goHome = React.useCallback(() => {
      router.replace("/");
    }, []);

    const { scale, fontSize } = sizeMap[size];
    const markWidth = 92 * scale;
    const markHeight = 70 * scale;
    const cameraBodyWidth = 48 * scale;
    const cameraBodyHeight = 30 * scale;
    const lensSize = 22 * scale;
    const reelSize = 24 * scale;
    const smallReelSize = 18 * scale;
    const bucketWidth = 30 * scale;
    const bucketHeight = 34 * scale;
    const starBarWidth = 60 * scale;
    const starSize = 8 * scale;

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-center ${className}`}
        style={style}
        onPress={goHome}
        activeOpacity={0.75}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go to home"
      >
        <View
          style={[
            styles.mark,
            {
              width: markWidth,
              height: markHeight,
              shadowRadius: 12 * scale,
              elevation: size === "small" ? 2 : 5,
            },
          ]}
        >
          <View
            style={[
              styles.reel,
              {
                left: 22 * scale,
                top: 0,
                width: reelSize,
                height: reelSize,
                borderRadius: reelSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.reelCenter,
                {
                  width: reelSize * 0.38,
                  height: reelSize * 0.38,
                  borderRadius: (reelSize * 0.38) / 2,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.reel,
              {
                left: 45 * scale,
                top: 13 * scale,
                width: smallReelSize,
                height: smallReelSize,
                borderRadius: smallReelSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.reelCenter,
                {
                  width: smallReelSize * 0.38,
                  height: smallReelSize * 0.38,
                  borderRadius: (smallReelSize * 0.38) / 2,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.cameraBody,
              {
                left: 7 * scale,
                top: 24 * scale,
                width: cameraBodyWidth,
                height: cameraBodyHeight,
                borderRadius: 7 * scale,
              },
            ]}
          >
            <View
              style={[
                styles.cameraHighlight,
                {
                  width: 18 * scale,
                  height: 5 * scale,
                  borderRadius: 3 * scale,
                  top: 5 * scale,
                  left: 6 * scale,
                },
              ]}
            />
            <View
              style={[
                styles.lens,
                {
                  right: 6 * scale,
                  top: 5 * scale,
                  width: lensSize,
                  height: lensSize,
                  borderRadius: lensSize / 2,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.cameraHood,
              {
                left: 0,
                top: 28 * scale,
                borderTopWidth: 9 * scale,
                borderBottomWidth: 9 * scale,
                borderRightWidth: 17 * scale,
              },
            ]}
          />

          <View
            style={[
              styles.bucket,
              {
                right: 4 * scale,
                top: 20 * scale,
                width: bucketWidth,
                height: bucketHeight,
                borderRadius: 5 * scale,
              },
            ]}
          >
            <View style={[styles.bucketStripe, { left: 8 * scale }]} />
            <View style={[styles.bucketStripe, { right: 6 * scale }]} />
            <View
              style={[
                styles.popcorn,
                {
                  left: 1 * scale,
                  top: -8 * scale,
                  width: 11 * scale,
                  height: 11 * scale,
                  borderRadius: 6 * scale,
                },
              ]}
            />
            <View
              style={[
                styles.popcorn,
                {
                  left: 10 * scale,
                  top: -13 * scale,
                  width: 13 * scale,
                  height: 13 * scale,
                  borderRadius: 7 * scale,
                },
              ]}
            />
            <View
              style={[
                styles.popcorn,
                {
                  right: -1 * scale,
                  top: -8 * scale,
                  width: 12 * scale,
                  height: 12 * scale,
                  borderRadius: 6 * scale,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.starBar,
              {
                left: 16 * scale,
                bottom: 0,
                width: starBarWidth,
                height: 14 * scale,
                borderRadius: 5 * scale,
                paddingHorizontal: 4 * scale,
              },
            ]}
          >
            {[0, 1, 2, 3, 4].map((item) => (
              <Image
                key={item}
                source={icons.star}
                style={{
                  width: starSize,
                  height: starSize,
                  marginHorizontal: 1 * scale,
                }}
                tintColor="#FACC15"
                resizeMode="contain"
              />
            ))}
          </View>
        </View>

        {showWordmark && (
          <Text
            className="text-white font-bold ml-2"
            style={{ fontSize, letterSpacing: 0 }}
          >
            Movie App
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

MovieLogo.displayName = "MovieLogo";

const styles = StyleSheet.create({
  mark: {
    position: "relative",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
  },
  reel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F1F23",
    borderWidth: 1,
    borderColor: "#3A3A42",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  reelCenter: {
    backgroundColor: "#4B4B55",
  },
  cameraBody: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "#111113",
    borderWidth: 1,
    borderColor: "#3A3A42",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraHighlight: {
    position: "absolute",
    backgroundColor: "#F4F4F5",
    opacity: 0.85,
  },
  lens: {
    position: "absolute",
    backgroundColor: "#2B2B31",
    borderWidth: 3,
    borderColor: "#6F6F7A",
  },
  cameraHood: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#18181B",
    transform: [{ rotate: "-8deg" }],
  },
  bucket: {
    position: "absolute",
    overflow: Platform.OS === "web" ? "hidden" : "visible",
    backgroundColor: "#D51F2A",
    borderWidth: 1,
    borderColor: "#F4F4F5",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  bucketStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#F4F4F5",
  },
  popcorn: {
    position: "absolute",
    backgroundColor: "#FACC15",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  starBar: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D51F2A",
    borderWidth: 1,
    borderColor: "#EF4444",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default MovieLogo;
