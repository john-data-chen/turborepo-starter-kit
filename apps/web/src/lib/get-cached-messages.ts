import { cacheLife } from "next/cache";

export async function getCachedMessages(locale: string) {
  "use cache";
  cacheLife("days");

  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // Fallback to default locale (en) if specific locale messages not found
    return (await import(`../../messages/en.json`)).default;
  }
}
