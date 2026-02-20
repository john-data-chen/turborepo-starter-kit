import { Stack } from "expo-router";

export default function ProjectsLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ presentation: "formSheet" }} />
    </Stack>
  );
}
