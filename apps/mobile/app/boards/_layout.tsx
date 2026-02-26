import { Stack } from "expo-router/stack";

export default function BoardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: "hsl(180, 35%, 5%)" },
        headerTitleStyle: { color: "hsl(180, 20%, 100%)" },
        headerTintColor: "hsl(180, 20%, 100%)"
      }}
    />
  );
}
