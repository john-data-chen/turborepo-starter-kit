import { Link as RouterLink } from "expo-router";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  ActivityIndicator as RNActivityIndicator
} from "react-native";
import { useCssElement } from "react-native-css";
import { useNativeVariable } from "react-native-css";

// Hook to read CSS custom properties at runtime (theme-aware)
// Usage: const bg = useCSSVariable("--color-background");
export const useCSSVariable =
  process.env.EXPO_OS !== "web" ? useNativeVariable : (variable: string) => `var(${variable})`;

export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

export const Text = (props: React.ComponentProps<typeof RNText> & { className?: string }) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string;
  contentContainerClassName?: string;
};

export const ScrollView = (props: ScrollViewProps) => {
  return (useCssElement as any)(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle"
  });
};
ScrollView.displayName = "CSS(ScrollView)";

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return (useCssElement as any)(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
) => {
  return (useCssElement as any)(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

export const Link = (props: React.ComponentProps<typeof RouterLink> & { className?: string }) => {
  return (useCssElement as any)(RouterLink, props, { className: "style" });
};
Link.displayName = "CSS(Link)";

export const ActivityIndicator = (
  props: React.ComponentProps<typeof RNActivityIndicator> & { className?: string }
) => {
  return (useCssElement as any)(RNActivityIndicator, props, { className: "style" });
};
ActivityIndicator.displayName = "CSS(ActivityIndicator)";
