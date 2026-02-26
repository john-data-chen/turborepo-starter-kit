import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "hsl(180, 35%, 5%)" },
        headerTitleStyle: { fontSize: 18, color: "hsl(180, 20%, 100%)" },
        headerTintColor: "hsl(180, 20%, 100%)",
        tabBarStyle: { backgroundColor: "hsl(180, 35%, 5%)", borderTopColor: "hsl(180, 20%, 18%)" },
        tabBarActiveTintColor: "hsl(180, 75%, 45%)",
        tabBarInactiveTintColor: "hsl(180, 25%, 85%)",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("sidebar.overview"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source="sf:rectangle.stack"
              style={{ width: size, height: size, tintColor: color }}
            />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title", { defaultValue: "Settings" }),
          tabBarIcon: ({ color, size }) => (
            <Image source="sf:gearshape" style={{ width: size, height: size, tintColor: color }} />
          )
        }}
      />
      <Tabs.Screen name="error" options={{ href: null }} />
      <Tabs.Screen name="loading" options={{ href: null }} />
    </Tabs>
  );
}
