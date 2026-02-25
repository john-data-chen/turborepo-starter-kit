import { Stack } from "expo-router/stack";

export default function BoardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal"
      }}
    />
  );
}
