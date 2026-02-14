import { Link, Stack } from "expo-router";

import { Text, View } from "@/components/themed";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: "#2e78b7" }}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
