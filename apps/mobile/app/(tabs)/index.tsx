import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Hello World</Text>
      <Text className="mt-2 text-muted-foreground">Mobile app with NativeWind</Text>
    </View>
  );
}
