let suppressed = false;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const SUPPRESS_TIMEOUT_MS = 15_000;

export function suppressNextSyncToast() {
  suppressed = true;
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    suppressed = false;
    timeoutId = null;
  }, SUPPRESS_TIMEOUT_MS);
}

export function consumeSuppressFlag(): boolean {
  if (suppressed) {
    suppressed = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    return true;
  }
  return false;
}
