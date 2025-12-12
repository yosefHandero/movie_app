import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface YouTubeTrailerProps {
  videoId: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  className?: string;
  onHover?: (isHovering: boolean) => void;
}

export const YouTubeTrailer: React.FC<YouTubeTrailerProps> = ({
  videoId,
  autoPlay = false,
  muted = true,
  controls = true,
  loop = false,
  className = "",
  onHover,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isHovering && autoPlay && Platform.OS === "web") {
      // Small delay before playing to ensure smooth hover experience
      hoverTimeoutRef.current = setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src.replace(
            /autoplay=[01]/,
            "autoplay=1"
          );
        }
      }, 300);
    } else if (!isHovering && Platform.OS === "web") {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovering, autoPlay]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHover?.(false);
  };

  // YouTube embed URL with autoplay parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${
    autoPlay && isHovering ? "autoplay=1&" : ""
  }mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${
    loop ? 1 : 0
  }&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;

  if (Platform.OS === "web") {
    return (
      <View
        className={className}
        style={{ width: "100%", height: "100%" }}
        // @ts-ignore - web-only props
        onMouseEnter={handleMouseEnter}
        // @ts-ignore - web-only props
        onMouseLeave={handleMouseLeave}
      >
        <iframe
          // @ts-ignore - web-only iframe ref type
          ref={iframeRef as any}
          src={embedUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: 12,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </View>
    );
  }

  // For mobile, use a simple link or WebView
  return (
    <View
      className={className}
      style={{ width: "100%", height: "100%" }}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      <iframe
        src={embedUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 12,
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
};

export default YouTubeTrailer;
