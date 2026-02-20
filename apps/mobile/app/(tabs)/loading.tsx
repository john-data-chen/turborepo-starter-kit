import { View, ActivityIndicator } from "@/lib/tw";

export default function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" />
    </View>
  );
}
