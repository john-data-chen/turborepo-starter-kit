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

let coalesceOpen = false;
const COALESCE_WINDOW_MS = 500;

// Multiple query listeners (boards/projects/tasks) can each detect a change in the
// same sync burst. Funnel their toasts through one window so a burst yields at most
// one toast, and let suppression apply to the whole burst.
// ponytail: 500ms fixed window; widen if poll responses ever drift further apart.
export function coalesceSyncToast(show: () => void) {
  if (coalesceOpen) {
    return;
  }
  coalesceOpen = true;
  setTimeout(() => {
    coalesceOpen = false;
  }, COALESCE_WINDOW_MS);

  if (consumeSuppressFlag()) {
    return;
  }
  show();
}
