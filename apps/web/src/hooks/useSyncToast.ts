"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { coalesceSyncToast } from "@/lib/api/sync-toast";

function getUpdatedAtSet(data: unknown): string {
  if (!Array.isArray(data)) {
    return "";
  }
  return data
    .map((item: Record<string, unknown>) => {
      const val = item.updatedAt;
      if (!val) {
        return "";
      }
      if (val instanceof Date) {
        return val.toISOString();
      }
      return JSON.stringify(val);
    })
    .sort()
    .join(",");
}

export function useSyncToastListener(data: unknown, enabled = true, key?: string) {
  const t = useTranslations("sync");
  const prevSnapshot = useRef<string>("");
  const isInitial = useRef(true);
  const prevKey = useRef(key);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const snapshot = getUpdatedAtSet(data);

    // Query key changed (switched board/project): rebaseline, don't toast on the jump.
    if (prevKey.current !== key) {
      prevKey.current = key;
      prevSnapshot.current = snapshot;
      return;
    }

    if (isInitial.current) {
      isInitial.current = false;
      prevSnapshot.current = snapshot;
      return;
    }

    if (snapshot && snapshot !== prevSnapshot.current) {
      prevSnapshot.current = snapshot;
      coalesceSyncToast(() => toast.success(t("synced")));
    }
  }, [data, enabled, key, t]);
}
