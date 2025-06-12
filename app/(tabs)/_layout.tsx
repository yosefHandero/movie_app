import { Tabs } from "expo-router";
import {ImageBackground, Image, Text, View, Linking,Platform} from "react-native";

import { images } from "@/constants/images";
import {useEffect} from "react";
import {account} from "@/services/appwrite";
import {icons} from "@/constants/icons";

function TabIcon({ focused, icon, title }: any) {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className="flex flex-row w-full flex-1 min-w-[112px] min-h-14 mt-4 justify-center items-center rounded-full overflow-hidden"
            >
                <Image source={icon} tintColor="#151312" className="size-5" />
                <Text className="text-secondary text-base font-semibold ml-2">
                    {title}
                </Text>
            </ImageBackground>
        );
    }

    return (
        <View className="size-full justify-center items-center mt-4 rounded-full">
            <Image source={icon} tintColor="#A8B5DB" className="size-5" />
        </View>
    );
}

export default function TabsLayout() {
    const isWeb = Platform.OS === "web";

    useEffect(() => {
        // Web-specific magic link handling
        const handleMagicLinkWeb = async () => {
            if (typeof window !== "undefined") {
                try {
                    const url = new URL(window.location.href);
                    const userId = url.searchParams.get("userId");
                    const secret = url.searchParams.get("secret");

                    if (userId && secret) {
                        await account.updateMagicURLSession(userId, secret);
                        console.log("✅ User successfully logged in with Magic URL on Web");
                        const user = await account.get();
                        console.log("Logged-in user:", user);
                        // Optionally, redirect to a different page or clear URL params
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } catch (err) {
                    console.error("❌ Magic link login failed on Web:", err);
                }
            }
        };

        // Mobile-specific magic link handling
        const handleMagicLinkMobile = async (event: { url: string }) => {
            try {
                const url = event.url;
                if (url.startsWith("movies://")) {
                    const params = new URLSearchParams(url.split("?")[1]);
                    const userId = params.get("userId");
                    const secret = params.get("secret");

                    if (userId && secret) {
                        await account.updateMagicURLSession(userId, secret);
                        console.log("✅ User successfully logged in with Magic URL on Mobile");
                        const user = await account.get();
                        console.log("Logged-in user:", user);
                    }
                }
            } catch (err) {
                console.error("❌ Magic link login failed on Mobile:", err);
            }
        };

        // Execute based on platform
        if (isWeb) {
            handleMagicLinkWeb();
        } else {
            // Add event listener for deep linking on mobile
            const subscription = Linking.addEventListener("url", handleMagicLinkMobile);
            // Check if the app was opened via a deep link initially
            Linking.getInitialURL().then((url) => {
                if (url) {
                    handleMagicLinkMobile({ url });
                }
            });

            // Cleanup subscription on unmount
            return () => {
                if (typeof subscription?.remove === "function") {
                    subscription.remove();
                }
            };
        }
    }, []);
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarStyle: {
                    backgroundColor: "#0F0D23",
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 36,
                    height: 52,
                    position: "absolute",
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#0F0D23",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "index",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    ),
                }}
            />

            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.search} title="Search" />
                    ),
                }}
            />

            <Tabs.Screen
                name="saved"
                options={{
                    title: "Save",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.save} title="Save" />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.person} title="Profile" />
                    ),
                }}
            />
        </Tabs>
    );
}