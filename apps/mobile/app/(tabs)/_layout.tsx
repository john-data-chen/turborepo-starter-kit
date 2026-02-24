import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs>
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
          title: "Settings",
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
