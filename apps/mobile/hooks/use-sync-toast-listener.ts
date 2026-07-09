import { useEffect, useRef } from "react";
import { toast } from "sonner-native";

import { i18n } from "@/lib/i18n";

import { coalesceSyncToast } from "./use-sync-toast";

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
      return String(val);
    })
    .sort()
    .join(",");
}

export function useSyncToastListener(data: unknown, enabled = true, key?: string) {
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
      coalesceSyncToast(() => toast.success(i18n.t("sync.synced")));
    }
  }, [data, enabled, key]);
}
