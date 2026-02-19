"use client";

import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";

export default function WorkspaceError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">{t("workspaceError")}</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset} variant="outline">
        {t("tryAgain")}
      </Button>
    </div>
  );
}
