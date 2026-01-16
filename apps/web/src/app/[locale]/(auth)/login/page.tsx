import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import SignInView from "@/components/auth/SignInView";

interface Props {
  params: { locale: string };
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
export const dynamic = "force-static";

export default function LoginPage() {
  return <SignInView />;
}
