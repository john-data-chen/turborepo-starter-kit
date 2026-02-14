import EditScreenInfo from "@/components/edit-screen-info";
import { Text, View } from "@/components/themed";

export default function TabTwoScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Tab Two</Text>
      <View
        style={{ marginVertical: 30, height: 1, width: "80%" }}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}
