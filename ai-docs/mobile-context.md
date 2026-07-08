# Mobile Architecture Context

> Load this file when working on `apps/mobile`. Referenced by `building-native-ui` skill.

## Routes (Expo Router, file-based, typed)

- `app/_layout.tsx` — GestureHandlerRootView → QueryClientProvider → auth guard → Stack
- `app/(auth)/login.tsx` — Email login, KeyboardAvoidingView
- `app/(tabs)/` — Bottom tabs: index (boards), settings (theme/lang/logout)
- `app/boards/[boardId].tsx` — Board detail, project list, status filter, pull-to-refresh
- `app/boards/form.tsx` — Create/edit board (formSheet)
- `app/projects/new.tsx` — Create/edit project (formSheet, reuse via `projectId`)
- `app/tasks/[taskId].tsx` — Edit task: status, assignee, due date, delete
- `app/tasks/new.tsx` — Create task (formSheet)

## Components (`components/`)

`board-card`, `board-actions`, `project-column`, `task-card` (swipeable), `sortable-task-list`, `move-task-sheet`

## Hooks (`hooks/`)

TanStack Query + key factories (`BOARD_KEYS`, `PROJECT_KEYS`, `TASK_KEYS`). `use-auth`, `use-boards`, `use-projects`, `use-tasks` (+`useMoveTask`), `use-users`

## API (`lib/api/`)

`fetchWithAuth` (token injection, 401 auto-logout) → `board-api`, `project-api`, `task-api`, `user-api`. URL: `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`)

## Styling

Import from `@/lib/tw`, NOT `react-native`. Theme colors via `className` or `useCSSVariable("--color-*")`.

## Theme/Lang

AsyncStorage (`lib/theme.ts`, `lib/language.ts`). Theme via `Appearance.setColorScheme()`.

## Testing (22 files, Vitest)

Aliases `react-native` → `react-native-web`, 80% coverage threshold.

## i18n (Mobile)

i18next: `defaultVariables: { appName: "Expo Project Manager" }`, persisted lang via AsyncStorage, device locale via `expo-localization`

## StorageAdapter (Mobile Auth)

`@repo/store` → `createAuthStore(adapter)` with `expo-secure-store` adapter (`apps/mobile/stores/auth.ts`). Auth service: `lib/auth/auth-service.ts` (token via SecureStore → login → store → fetch profile). Root layout: `useAuth()` → redirect `/(auth)/login` or `/(tabs)`.

## Interaction Design

| Action | Web | Mobile |
|--|--|--|
| Reorder tasks | Drag in column | Sorted by `orderInProject`, server-synced |
| Move across columns | Drag to column | Swipe left → ActionSheet/Modal |
| Change status | Dropdown | Swipe right → cycle (TODO→IN_PROGRESS→DONE) + haptics |
| Edit/Delete | Inline buttons | `Link.Menu` context menu + haptics |
| Create entities | Dialog/inline | FormSheet (`formSheet`, `sheetGrabberVisible`) |
| Board actions | Dropdown menu | `Alert.alert` action sheet |

## Mobile Pitfalls

> [!CAUTION]
> **`className` needs tw wrapper**: Import from `@/lib/tw`, NOT bare RN components. Unwrapped `className` silently fails.

> [!CAUTION]
> **Auth = SecureStore**: `apps/mobile/stores/auth.ts` uses `expo-secure-store`. Never AsyncStorage for tokens. (AsyncStorage OK for theme/lang.)

> [!CAUTION]
> **API = fetchWithAuth**: All calls through `lib/api/fetch-with-auth.ts`. Never raw `fetch()`. Handles token, 401 logout, error parsing.

> [!CAUTION]
> **Query key factories**: Follow pattern `all → lists → list(filters) → details → detail(id)`. Invalidation must use correct key level.

> [!CAUTION]
> **Colors**: Never hardcode. Use `className` tokens or `useCSSVariable("--color-*")`. Exception: hardcoded HSL in nav chrome.

> [!CAUTION]
> **formSheet presentation**: Create/edit screens use `presentation: "formSheet"` + `sheetGrabberVisible`, `headerLeft` cancel, `headerRight` save.

> [!CAUTION]
> **useUpdateTask**: Auto-injects `lastModifier` — do NOT pass from components.

> [!CAUTION]
> **Expo latest SDK + React latest + React Compiler**: No deprecated lifecycle methods or legacy context API.
