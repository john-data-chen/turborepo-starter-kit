import { Link, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";

export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, "href"> & { href: string }
) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href as Href}
      onPress={(e) => {
        if (process.env.EXPO_OS !== "web") {
          e.preventDefault();
          WebBrowser.openBrowserAsync(props.href);
        }
      }}
    />
  );
}
