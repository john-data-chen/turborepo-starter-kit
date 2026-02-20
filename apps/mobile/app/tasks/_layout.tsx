import { Stack } from "expo-router";

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen name="[taskId]" />
      <Stack.Screen name="new" options={{ presentation: "formSheet" }} />
    </Stack>
  );
}
