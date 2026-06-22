import { WatchProvidersResult } from "@/interfaces/interfaces";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface WatchOptionsCollapseProps {
  providers: WatchProvidersResult | null | undefined;
  loading?: boolean;
  region?: string;
}

const ProviderRow = ({
  title,
  items,
}: {
  title: string;
  items: WatchProvidersResult["flatrate"];
}) => {
  if (!items.length) return null;

  return (
    <View className="mb-4">
      <Text className="text-text-tertiary text-xs font-semibold uppercase mb-2">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map((provider) => (
          <View
            key={`${title}-${provider.provider_id}`}
            className="flex-row items-center gap-2 px-2 py-1.5 rounded-lg bg-bg-elevated border border-border-light"
          >
            {provider.logo_path ? (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w45${provider.logo_path}`,
                }}
                style={{ width: 24, height: 24, borderRadius: 4 }}
                contentFit="cover"
              />
            ) : null}
            <Text className="text-text-secondary text-xs font-medium">
              {provider.provider_name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const WatchOptionsCollapse: React.FC<WatchOptionsCollapseProps> = ({
  providers,
  loading = false,
  region = "US",
}) => {
  const [expanded, setExpanded] = useState(false);

  const hasProviders =
    providers &&
    (providers.flatrate.length > 0 ||
      providers.rent.length > 0 ||
      providers.buy.length > 0);

  return (
    <View
      style={{
        backgroundColor: "rgba(12, 12, 16, 0.85)",
        borderWidth: 1,
        borderColor: "rgba(167, 139, 250, 0.2)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <Text className="text-text-primary text-base font-semibold">
          Where to Watch
        </Text>
        <Text className="text-accent-primary text-sm font-semibold">
          {expanded ? "Hide" : "Show"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-border-light">
          {loading ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#A78BFA" />
            </View>
          ) : hasProviders ? (
            <>
              <Text className="text-text-tertiary text-xs mb-3">
                Official streaming options in {region}
              </Text>
              <ProviderRow title="Stream" items={providers!.flatrate} />
              <ProviderRow title="Rent" items={providers!.rent} />
              <ProviderRow title="Buy" items={providers!.buy} />
              {providers?.link ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(providers.link!)}
                  className="mt-2 self-start"
                >
                  <Text className="text-accent-primary text-xs font-semibold">
                    View on TMDB
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text className="text-text-tertiary text-sm py-2">
              Streaming info not available.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
