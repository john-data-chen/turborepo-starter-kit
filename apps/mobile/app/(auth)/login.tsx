import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Alert } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "@/lib/tw";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, loginMutation } = useAuth();
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email) {
      Alert.alert("Error", t("login.invalidEmail"));
      return;
    }
    login(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 items-center justify-center gap-6 bg-background p-8">
        <Text className="text-3xl font-bold text-foreground">{t("login.title")}</Text>
        <Text className="text-center text-muted-foreground">{t("login.formHint")}</Text>

        {loginMutation.isError && (
          <Text className="text-center text-destructive">{loginMutation.error?.message}</Text>
        )}

        <TextInput
          className="w-full rounded-lg border border-border bg-input p-4 text-foreground"
          placeholder={t("login.emailPlaceholder")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Pressable
          className="w-full flex-row items-center justify-center rounded-lg bg-primary p-4"
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator className="mr-2 text-primary-foreground" />
          ) : null}
          <Text className="font-semibold text-primary-foreground">{t("login.continueButton")}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
