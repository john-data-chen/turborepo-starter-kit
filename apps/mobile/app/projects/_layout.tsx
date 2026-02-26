import { Stack } from "expo-router";

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "hsl(180, 35%, 5%)" },
        headerTitleStyle: { color: "hsl(180, 20%, 100%)" },
        headerTintColor: "hsl(180, 20%, 100%)"
      }}
    >
      <Stack.Screen name="new" options={{ presentation: "formSheet" }} />
    </Stack>
  );
}
