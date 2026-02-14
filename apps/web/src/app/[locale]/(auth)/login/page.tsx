import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import SignInView from "@/components/auth/SignInView";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "login" });

  return {
    title: t("title"),
    description: t("description")
  };
}

// This page is statically generated at build time
// MIGRATED from: export const dynamic = 'force-static'
// -> Add "use cache" to opt into caching (dynamic is now the default)
export default async function LoginPage() {
  "use cache";
  return <SignInView />;
}
