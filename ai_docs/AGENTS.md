# AI Guidelines

## Behavioral Framework

- **MANDATORY**: Load `caveman` skill (global, every session) + `karpathy-guidelines` (every coding task) before any work
- Use MCP servers when they save time (see MCP section).
- Convention first: analyze existing patterns before changes
- Verify, then act: never assume deps/commands exist — check package.json/config
- Test-driven: find tests → run → understand → write tests → implement
- Incremental verification: lint, type-check, test, build after each significant change

> [!TIP]
> Package info → use `context7-mcp`. Next.js project → call `init` from next-devtools-mcp FIRST (confirm with user).

## Skill Dispatch Guide

Load matching skill **before writing code**.

### Universal (ALWAYS CHECK FIRST)

| Condition                                                             | Skill                 |
| :-------------------------------------------------------------------- | :-------------------- |
| **Every session/task** — token optimization, terse communication      | `caveman`             |
| **Any coding task** — writing, refactoring, fixing bugs               | `karpathy-guidelines` |
| Task handoff, session continuity, progress tracking, multi-step plans | `session-handoff`     |

### API

| Condition                                                                        | Skill                   |
| :------------------------------------------------------------------------------- | :---------------------- |
| NestJS modules, DI, guards, pipes, interceptors, Mongoose, testing, architecture | `nestjs-best-practices` |

### Mobile

| Condition                                                                 | Skill                  |
| :------------------------------------------------------------------------ | :--------------------- |
| Expo screens, navigation, animations, native tabs, styling, layout        | `building-native-ui`   |
| Server-side API endpoints in Expo Router, EAS Hosting, Cloudflare Workers | `expo-api-routes`      |
| Custom dev client builds, TestFlight distribution, native modules         | `expo-dev-client`      |
| Tailwind CSS / NativeWind setup in Expo                                   | `expo-tailwind-setup`  |
| Network requests, API calls, fetch, caching, offline, auth tokens         | `native-data-fetching` |
| Upgrading Expo SDK, dependency conflicts, New Architecture migration      | `upgrading-expo`       |
| Web code on native via webview, Canvas/WebGL, web library migration       | `use-dom`              |

### Web

| Condition                                                                          | Skill                         |
| :--------------------------------------------------------------------------------- | :---------------------------- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices`         |
| `use cache`, PPR, cacheLife, cacheTag, updateTag, static/dynamic mix               | `next-cache-components`       |
| Component API design, compound components, boolean prop cleanup, render props      | `vercel-composition-patterns` |
| React/Next.js perf: re-renders, bundle size, waterfalls, memoization               | `vercel-react-best-practices` |
| UI review, a11y audit, UX compliance, design guidelines                            | `web-design-guidelines`       |
| Turborepo pipelines, caching, filtering, monorepo structure                        | `turborepo`                   |

## MCP Servers

| Server            | Use When                                                                                                         |
| :---------------- | :--------------------------------------------------------------------------------------------------------------- |
| `context7`        | Need current library/package docs                                                                                |
| `next-devtools`   | Dev server diagnostics, route inspection. Call `init` tool FIRST when starting Next.js work (confirm with user). |
| `chrome-devtools` | Browser debugging, DOM inspection, performance analysis, network requests                                        |

## Project Overview

### Repo Structure

| Type | Package                    | Description                                       |
| ---- | -------------------------- | ------------------------------------------------- |
| App  | `apps/api`                 | Nest.js (Express)                                 |
| App  | `apps/web`                 | Next.js AppRouter                                 |
| App  | `apps/mobile`              | React Native (Expo + React latest)                |
| Pkg  | `packages/global-tsconfig` | TS configs                                        |
| Pkg  | `packages/i18n`            | Shared i18n (EN/DE), locale config, Messages type |
| Pkg  | `packages/store`           | Domain types, Zustand stores, StorageAdapter      |
| Pkg  | `packages/ui`              | Shadcn UI (web-only, not mobile)                  |

**Stack**: TypeScript strict, PNPM, Turborepo, Vitest, Playwright, Zustand + TanStack Query, React Hook Form + Zod

#### Shadcn UI

In `packages/ui/components/ui` — modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first. Shadcn components = last resort.

#### i18n (`packages/i18n`)

Single source for EN/DE. Uses `{appName}` interpolation:

- **Web** (next-intl): `interpolateAppName()` → `"Next Project Manager"`
- **Mobile** (i18next): `defaultVariables: { appName: "Expo Project Manager" }`, persisted lang via AsyncStorage, device locale via `expo-localization`
- Files: `packages/i18n/src/locales/{en,de}.json`
- Exports: `messages`, `locales`, `defaultLocale`, `Locale`, `Messages`

#### StorageAdapter (Cross-Platform Auth)

`@repo/store` → `createAuthStore(adapter)`:

- Web: `localStorage` adapter (`apps/web/src/stores/auth.ts`)
- Mobile: `expo-secure-store` adapter (`apps/mobile/stores/auth.ts`)
- Mobile auth: `lib/auth/auth-service.ts` (token via SecureStore → login → store → fetch profile)
- Root layout: `useAuth()` → redirect `/(auth)/login` or `/(tabs)`

#### Mobile (`apps/mobile`)

**Routes** (Expo Router, file-based, typed):

- `app/_layout.tsx` — GestureHandlerRootView → QueryClientProvider → auth guard → Stack
- `app/(auth)/login.tsx` — Email login, KeyboardAvoidingView
- `app/(tabs)/` — Bottom tabs: index (boards), settings (theme/lang/logout)
- `app/boards/[boardId].tsx` — Board detail, project list, status filter, pull-to-refresh
- `app/boards/form.tsx` — Create/edit board (formSheet)
- `app/projects/new.tsx` — Create/edit project (formSheet, reuse via `projectId`)
- `app/tasks/[taskId].tsx` — Edit task: status, assignee, due date, delete
- `app/tasks/new.tsx` — Create task (formSheet)

**Components** (`components/`): `board-card`, `board-actions`, `project-column`, `task-card` (swipeable), `sortable-task-list`, `move-task-sheet`

**Hooks** (`hooks/`): TanStack Query + key factories (`BOARD_KEYS`, `PROJECT_KEYS`, `TASK_KEYS`). `use-auth`, `use-boards`, `use-projects`, `use-tasks` (+`useMoveTask`), `use-users`

**API** (`lib/api/`): `fetchWithAuth` (token injection, 401 auto-logout) → `board-api`, `project-api`, `task-api`, `user-api`. URL: `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`)

**Styling**: Import from `@/lib/tw`, NOT `react-native`. Theme colors via `className` or `useCSSVariable("--color-*")`.

**Theme/Lang**: AsyncStorage (`lib/theme.ts`, `lib/language.ts`). Theme via `Appearance.setColorScheme()`.

**Testing** (22 files, Vitest): aliases `react-native` → `react-native-web`, 80% coverage threshold.

#### Mobile Interaction Design

| Action              | Web            | Mobile                                                |
| ------------------- | -------------- | ----------------------------------------------------- |
| Reorder tasks       | Drag in column | Sorted by `orderInProject`, server-synced             |
| Move across columns | Drag to column | Swipe left → ActionSheet/Modal                        |
| Change status       | Dropdown       | Swipe right → cycle (TODO→IN_PROGRESS→DONE) + haptics |
| Edit/Delete         | Inline buttons | `Link.Menu` context menu + haptics                    |
| Create entities     | Dialog/inline  | FormSheet (`formSheet`, `sheetGrabberVisible`)        |
| Board actions       | Dropdown menu  | `Alert.alert` action sheet                            |

### API Architecture (`apps/api`)

> Detailed patterns → load `nestjs-best-practices` skill.

- `Service → Repository → Model (Mongoose)` — services never inject `Model<T>` directly
- Cascade deletes via `@nestjs/event-emitter`: Board→Projects→Tasks (no `forwardRef`)
- `AllExceptionsFilter` as `APP_FILTER` — controllers never try-catch
- Tests: manual constructor + `vi.fn()` mocks, NOT `TestingModule`

## Naming

| Type                | Convention  | Example                   |
| ------------------- | ----------- | ------------------------- |
| Components (web)    | PascalCase  | `DatePicker.tsx`          |
| Components (mobile) | kebab-case  | `board-card.tsx`          |
| Utilities           | camelCase   | `dateUtils.ts`            |
| Constants           | UPPER_SNAKE | `API_ENDPOINTS.ts`        |
| Types               | PascalCase  | `UserData`, `ApiResponse` |
| Hooks (mobile)      | kebab-case  | `use-auth.ts`             |

### Exports

```typescript
// packages/ui/package.json → "exports": { "./ComponentName": "./src/ComponentName/index.ts" }
// Usage: import { ComponentName } from "@repo/ui/ComponentName";
```

## Commands

```bash
pnpm install          # Install deps
pnpm lint --fix       # Fix lint
pnpm test             # Run tests
pnpm build            # Prod build
pnpm turbo clean      # Clean cache
pnpm lint-staged      # Lint+format (stage files first)
```

> [!NOTE]
> Dev server already running via `pnpm dev`. API uses Rspack with hot reload.

## Pitfalls

> [!CAUTION]
> **next-intl nav**: `router.push()`/`router.replace()` from `@/i18n/navigation` auto-prepends locale. Use `"/boards"` NOT `"/en/boards"`.

> [!NOTE]
> **Single QueryClient**: Only `providers/client-providers.tsx` creates it. No second instance.

> [!CAUTION]
> **Mobile `className`**: Import from `@/lib/tw`, NOT bare RN components. Unwrapped `className` silently fails.

> [!CAUTION]
> **Mobile auth = SecureStore**: `apps/mobile/stores/auth.ts` uses `expo-secure-store`. Never AsyncStorage for tokens. (AsyncStorage OK for theme/lang.)

> [!CAUTION]
> **Mobile API = fetchWithAuth**: All calls through `lib/api/fetch-with-auth.ts`. Never raw `fetch()`. Handles token, 401 logout, error parsing.

> [!CAUTION]
> **Query key factories**: Follow pattern `all → lists → list(filters) → details → detail(id)`. Invalidation must use correct key level.

> [!CAUTION]
> **Mobile colors**: Never hardcode. Use `className` tokens or `useCSSVariable("--color-*")`. Exception: hardcoded HSL in nav chrome.

> [!CAUTION]
> **formSheet presentation**: Create/edit screens use `presentation: "formSheet"` + `sheetGrabberVisible`, `headerLeft` cancel, `headerRight` save.

> [!CAUTION]
> **useUpdateTask**: Auto-injects `lastModifier` — do NOT pass from components.

> [!CAUTION]
> **Expo latest SDK + React latest + React Compiler**: No deprecated lifecycle methods or legacy context API.

## Commit Workflow

> [!IMPORTANT]
> [Conventional Commits](https://conventionalcommits.org/): `feat(scope): desc` / `fix(scope): desc`

1. `git add /path/to/file`
2. `pnpm lint-staged && pnpm build --filter=@repo/web`
3. Fix all lint errors/warnings
4. `git reset`
5. Suggest commit message (never auto-commit)
