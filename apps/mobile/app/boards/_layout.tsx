import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

export default function BoardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal"
      }}
    />
  );
}
