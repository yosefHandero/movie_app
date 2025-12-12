import { CategoryPill } from "@/components/CategoryPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { Genre } from "@/interfaces/interfaces";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

interface CategoryPillsLoopProps {
  genres: Genre[];
  loading: boolean;
  onGenrePress?: (genre: Genre) => void;
  selectedGenreId?: number | null;
}

export const CategoryPillsLoop = ({
  genres,
  loading,
  onGenrePress,
  selectedGenreId,
}: CategoryPillsLoopProps) => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPosition = useRef(0);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [duplicatedGenres, setDuplicatedGenres] = useState<Genre[]>([]);
  const isScrollingRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopAfter20sTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const resumeAfterPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  // Use ref to store current genres length to avoid closure issues
  const genresLengthRef = useRef(genres.length);

  // Duplicate genres for seamless loop
  useEffect(() => {
    // Update ref with current genres length
    genresLengthRef.current = genres.length;

    // Cancel any pending timers when genres change
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (stopAfter20sTimerRef.current) {
      clearTimeout(stopAfter20sTimerRef.current);
      stopAfter20sTimerRef.current = null;
    }
    if (resumeAfterPauseTimerRef.current) {
      clearTimeout(resumeAfterPauseTimerRef.current);
      resumeAfterPauseTimerRef.current = null;
    }

    if (genres.length > 0) {
      // Duplicate the array 3 times for smooth infinite scroll
      setDuplicatedGenres([...genres, ...genres, ...genres]);
      // Reset scroll position when genres change
      scrollPosition.current = 0;
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
    } else {
      // Clear duplicated genres when genres becomes empty
      setDuplicatedGenres([]);
      scrollPosition.current = 0;
    }
  }, [genres]);

  // Auto-scroll loop - smooth continuous scrolling
  useEffect(() => {
    if (duplicatedGenres.length === 0 || isScrollingRef.current) return;

    const startAutoScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      scrollIntervalRef.current = setInterval(() => {
        if (!scrollViewRef.current || isScrollingRef.current) return;

        scrollPosition.current += 0.5; // Smooth pixel-by-pixel scrolling
        scrollViewRef.current.scrollTo({
          x: scrollPosition.current,
          animated: false, // Use false for smooth continuous scroll
        });

        // Reset to beginning when reaching the end of first set (seamless loop)
        const itemWidth = 120; // Approximate width of each pill + margin
        const firstSetWidth = genresLengthRef.current * itemWidth;
        if (firstSetWidth > 0 && scrollPosition.current >= firstSetWidth) {
          scrollPosition.current = 0;
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: 0,
              animated: false, // Instant reset for seamless loop
            });
          }
        }
      }, 16); // ~60fps smooth scrolling

      // Stop after 20 seconds
      if (stopAfter20sTimerRef.current) {
        clearTimeout(stopAfter20sTimerRef.current);
      }
      stopAfter20sTimerRef.current = setTimeout(() => {
        // Stop the auto-scroll
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }

        // Resume after 2 seconds pause
        if (resumeAfterPauseTimerRef.current) {
          clearTimeout(resumeAfterPauseTimerRef.current);
        }
        resumeAfterPauseTimerRef.current = setTimeout(() => {
          // Restart the loop
          if (!isScrollingRef.current && duplicatedGenres.length > 0) {
            startAutoScroll();
          }
        }, 2000); // 2 second pause before resuming
      }, 20000); // Stop after 20 seconds
    };

    // Start after a short delay
    const timer = setTimeout(startAutoScroll, 500);
    return () => {
      clearTimeout(timer);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (stopAfter20sTimerRef.current) {
        clearTimeout(stopAfter20sTimerRef.current);
      }
      if (resumeAfterPauseTimerRef.current) {
        clearTimeout(resumeAfterPauseTimerRef.current);
      }
    };
  }, [duplicatedGenres, genres.length]);

  const stopAutoScroll = () => {
    isScrollingRef.current = true;
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (stopAfter20sTimerRef.current) {
      clearTimeout(stopAfter20sTimerRef.current);
      stopAfter20sTimerRef.current = null;
    }
    if (resumeAfterPauseTimerRef.current) {
      clearTimeout(resumeAfterPauseTimerRef.current);
      resumeAfterPauseTimerRef.current = null;
    }
  };

  const handleScrollBeginDrag = () => {
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    // Don't restart immediately - wait for momentum to end
  };

  const handleMomentumScrollEnd = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    // Update scroll position to match actual scroll position
    const currentOffset = event.nativeEvent.contentOffset.x;
    const itemWidth = 120;
    // Use ref to get current genres length (avoids closure issue)
    const firstSetWidth = genresLengthRef.current * itemWidth;
    // Normalize to first set range (avoid division by zero)
    if (firstSetWidth > 0) {
      scrollPosition.current = currentOffset % firstSetWidth;
    } else {
      scrollPosition.current = 0;
    }

    isScrollingRef.current = false;
    // Restart auto-scroll after user stops interacting (5 seconds)
    restartTimerRef.current = setTimeout(() => {
      if (!isScrollingRef.current && duplicatedGenres.length > 0) {
        const startAutoScroll = () => {
          if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
          }

          scrollIntervalRef.current = setInterval(() => {
            if (!scrollViewRef.current || isScrollingRef.current) return;
            scrollPosition.current += 0.5;
            scrollViewRef.current.scrollTo({
              x: scrollPosition.current,
              animated: false,
            });
            const itemWidth = 120;
            // Use ref to get current genres length (avoids closure issue)
            const firstSetWidth = genresLengthRef.current * itemWidth;
            if (firstSetWidth > 0 && scrollPosition.current >= firstSetWidth) {
              scrollPosition.current = 0;
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: 0, animated: false });
              }
            }
          }, 16);
        };
        startAutoScroll();
      }
    }, 5000); // Resume after 5 seconds of no interaction
  };

  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
      >
        <View className="flex-row gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              width={100}
              height={36}
              borderRadius={18}
              className="mr-3"
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  if (genres.length === 0) return null;

  const handlePress = (genre: Genre) => {
    if (onGenrePress) {
      onGenrePress(genre);
    } else {
      router.push("/(tabs)/search");
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEventThrottle={16}
      decelerationRate="fast"
    >
      {duplicatedGenres.map((genre: Genre, index: number) => (
        <CategoryPill
          key={`${genre.id}-${index}`}
          label={genre.name}
          onPress={() => handlePress(genre)}
          isSelected={selectedGenreId === genre.id}
          className="mr-3 mb-3"
        />
      ))}
    </ScrollView>
  );
};
