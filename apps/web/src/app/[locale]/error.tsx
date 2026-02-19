"use client";

import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <p className="text-muted-foreground">{error.message}</p>
      {error.digest && <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>}
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  );
}
