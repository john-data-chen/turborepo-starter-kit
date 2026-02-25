import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_KEY = "language-preference";

export async function loadLanguagePreference(): Promise<string | null> {
  return AsyncStorage.getItem(LANGUAGE_KEY);
}

export async function saveLanguagePreference(lang: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}
