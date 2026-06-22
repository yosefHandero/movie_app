import { CategoryPill } from "@/components/CategoryPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { Genre } from "@/interfaces/interfaces";
import { getFunGenreLabel } from "@/utils/movieInsights";
import { useRouter } from "expo-router";
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
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
      decelerationRate="fast"
    >
      {genres.map((genre: Genre) => {
        const fun = getFunGenreLabel(genre.name);
        return (
          <CategoryPill
            key={genre.id}
            label={fun.label}
            description={`${fun.label} — ${fun.description}`}
            onPress={() => handlePress(genre)}
            isSelected={selectedGenreId === genre.id}
            className="mr-3 mb-3"
          />
        );
      })}
    </ScrollView>
  );
};
