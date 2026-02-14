import React from "react";

import Colors from "@/constants/Colors";

import { ExternalLink } from "./external-link";
import { MonoText } from "./styled-text";
import { Text, View } from "./themed";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View style={{ alignItems: "center", marginHorizontal: 50 }}>
        <Text
          style={{ fontSize: 17, lineHeight: 24, textAlign: "center" }}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Open up the code for this screen:
        </Text>

        <View
          style={{ borderRadius: 3, paddingHorizontal: 4, marginVertical: 7 }}
          darkColor="rgba(255,255,255,0.05)"
          lightColor="rgba(0,0,0,0.05)"
        >
          <MonoText>{path}</MonoText>
        </View>

        <Text
          style={{ fontSize: 17, lineHeight: 24, textAlign: "center" }}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>

      <View style={{ marginTop: 15, marginHorizontal: 20, alignItems: "center" }}>
        <ExternalLink
          style={{ paddingVertical: 15 }}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text style={{ textAlign: "center" }} lightColor={Colors.light.tint}>
            Tap here if your app doesn&apos;t automatically update after making changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}
