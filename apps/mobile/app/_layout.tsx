import "../global.css";
import "@/lib/i18n";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/query-client";
import { applyThemePreference, loadThemePreference } from "@/lib/theme";
import { View, ActivityIndicator } from "@/lib/tw";

export { ErrorBoundary } from "expo-router";

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  // Restore persisted theme preference on mount
  useEffect(() => {
    loadThemePreference().then((pref) => {
      applyThemePreference(pref);
    });
  }, []);

  useEffect(() => {
    if (isLoading || !isNavigationReady) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, isLoading, isNavigationReady, router]);

  if (isLoading || !isNavigationReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="boards" options={{ headerShown: false }} />
        <Stack.Screen name="tasks" options={{ headerShown: false }} />
        <Stack.Screen name="projects" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
