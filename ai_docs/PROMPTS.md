# AI Guidelines

## AI Assistant Behavioral Framework

- **Check MCP/skills before execution**:
  - **MANDATORY**: Check for `karpathy-guidelines` skill for ANY coding task.
  - Verify available and enabled tools
  - Suggest and confirm with the user which MCP/skill to use
  - Recommend missing ones if useful
- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

> [!TIP]
> If need to check package info, use `context7-mcp` if installed and enabled.
> When starting work on a Next.js project, call the `init` tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Ask user for confirmation before calling the tool.

## Skill Dispatch Guide

When a task matches conditions below, load the corresponding skill **before writing code**.

### Universal (CHECK FIRST, `ai_docs/skills/ai-optimization/`)

| Condition                                               | Skill                 |
| :------------------------------------------------------ | :-------------------- |
| **ANY coding task** (writing, refactoring, fixing bugs) | `karpathy-guidelines` |

### API (`ai_docs/skills/api/`)

| Condition                                                                                | Skill                   |
| :--------------------------------------------------------------------------------------- | :---------------------- |
| NestJS modules, DI, guards, pipes, interceptors, Mongoose queries, testing, architecture | `nestjs-best-practices` |

### Mobile (`ai_docs/skills/mobile/`)

| Condition                                                                   | Skill                  |
| :-------------------------------------------------------------------------- | :--------------------- |
| Expo screens, navigation, animations, native tabs, styling, layout patterns | `building-native-ui`   |
| Server-side API endpoints in Expo Router, EAS Hosting, Cloudflare Workers   | `expo-api-routes`      |
| Custom dev client builds, TestFlight distribution, native modules           | `expo-dev-client`      |
| Setting up or configuring Tailwind CSS / NativeWind in Expo                 | `expo-tailwind-setup`  |
| Any network request, API call, fetch, caching, offline support, auth tokens | `native-data-fetching` |
| Upgrading Expo SDK, fixing dependency conflicts, New Architecture migration | `upgrading-expo`       |
| Running web code on native via webview, Canvas/WebGL, web library migration | `use-dom`              |

### Web (`ai_docs/skills/web/`)

| Condition                                                                          | Skill                         |
| :--------------------------------------------------------------------------------- | :---------------------------- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices`         |
| `use cache` directive, PPR, cacheLife, cacheTag, updateTag, static/dynamic mix     | `next-cache-components`       |
| Component API design, compound components, boolean prop cleanup, render props      | `vercel-composition-patterns` |
| React/Next.js performance: re-renders, bundle size, waterfalls, memoization        | `vercel-react-best-practices` |
| UI review, accessibility audit, UX compliance, design guidelines                   | `web-design-guidelines`       |

## Project Overview

### Repository Structure

| Type        | Package                    | Description                                                    |
| ----------- | -------------------------- | -------------------------------------------------------------- |
| **App**     | `apps/api`                 | Nest.js (Express)                                              |
| **App**     | `apps/web`                 | Next.js AppRouter                                              |
| **App**     | `apps/mobile`              | React Native (Expo and React latest)                           |
| **Package** | `packages/global-tsconfig` | TypeScript configurations                                      |
| **Package** | `packages/i18n`            | Shared i18n translations (EN/DE), locale config, Messages type |
| **Package** | `packages/store`           | Domain types, Zustand stores, StorageAdapter pattern           |
| **Package** | `packages/ui`              | Shadcn UI Shared UI (web-only, not used by mobile)             |

**Key tech**: TypeScript strict, PNPM, Turborepo, Vitest, Playwright, Zustand + TanStack Query, React Hook Form + Zod

#### Shadcn UI Components

In `packages/ui/components/ui` — modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first, only modify Shadcn components as a last resort.

#### Shared i18n Package (`packages/i18n`)

Single source of truth for EN/DE translations. Uses `{appName}` interpolation:

- **Web** (next-intl): `interpolateAppName()` in `get-cached-messages.ts` → `"Next Project Manager"`
- **Mobile** (i18next): `lib/i18n/index.ts` → `defaultVariables: { appName: "Expo Project Manager" }` (from `constants/app.ts`), persisted language via AsyncStorage (`lib/language.ts`), device locale via `expo-localization`
- Translations: `packages/i18n/src/locales/en.json` and `de.json`
- Exports: `messages`, `locales`, `defaultLocale`, `Locale` type, `Messages` type

#### StorageAdapter Pattern (Cross-Platform Auth)

`@repo/store` exports `createAuthStore(adapter)` factory:

- **Web**: `localStorage` adapter in `apps/web/src/stores/auth.ts`
- **Mobile**: `expo-secure-store` adapter in `apps/mobile/stores/auth.ts`
- Mobile auth service: `lib/auth/auth-service.ts` (token via SecureStore, login → store token → fetch profile)
- Root layout auth guard: `useAuth()` session check → redirect to `/(auth)/login` or `/(tabs)`

#### Mobile Architecture (`apps/mobile`)

**Route structure** (Expo Router, file-based, typed routes enabled):

- `app/_layout.tsx` — Root: GestureHandlerRootView → QueryClientProvider → auth guard → Stack
- `app/(auth)/login.tsx` — Email login, KeyboardAvoidingView
- `app/(tabs)/` — Bottom tabs: index (boards overview), settings (theme/language/logout)
- `app/boards/[boardId].tsx` — Board detail: projects vertical list, status filter bar, pull-to-refresh
- `app/boards/form.tsx` — Create/edit board (formSheet presentation)
- `app/projects/new.tsx` — Create/edit project (formSheet, reuses for edit via `projectId` param)
- `app/tasks/[taskId].tsx` — Edit task: status, assignee (modal picker), due date (DateTimePicker), delete
- `app/tasks/new.tsx` — Create task (formSheet)

**Components** (`apps/mobile/components/`):

- `board-card.tsx` — Board list card with haptic press feedback, BoardActions menu
- `board-actions.tsx` — Alert.alert action sheet for edit/delete board
- `project-column.tsx` — Project card with task list, `Link.Menu`/`Link.MenuAction` context menu
- `task-card.tsx` — Swipeable card: Gesture Handler pan → swipe right cycles status, swipe left moves to project. `Link.Menu` for edit/move/delete
- `sortable-task-list.tsx` — Renders sorted tasks (by `orderInProject`), manages MoveTaskSheet state
- `move-task-sheet.tsx` — iOS: `ActionSheetIOS`; Android: Modal bottom sheet

**Hooks** (`apps/mobile/hooks/`):

- All hooks use **TanStack Query** with query key factory pattern (`BOARD_KEYS`, `PROJECT_KEYS`, `TASK_KEYS`)
- `use-auth.ts` — login mutation, session query, logout (clears SecureStore + QueryClient)
- `use-boards.ts` — CRUD + detail fetch, staleTime 5min, retry with exponential backoff
- `use-projects.ts` — CRUD scoped to boardId
- `use-tasks.ts` — CRUD + `useMoveTask` (cross-project move), `useUpdateTask` auto-injects `lastModifier`
- `use-users.ts` — User search for assignee picker

**API Layer** (`apps/mobile/lib/api/`):

- `fetch-with-auth.ts` — Centralized fetch wrapper: auto-attaches Bearer token, 401 → auto-logout + redirect, error parsing
- `board-api.ts`, `project-api.ts`, `task-api.ts`, `user-api.ts` — Typed API clients using `fetchWithAuth`
- API URL: `EXPO_PUBLIC_API_URL` env var, defaults to `http://localhost:3001`

**Styling**: Import UI from `@/lib/tw`, NOT `react-native` (see CAUTION below). `useCSSVariable("--color-*")` for inline theme access.

**Theme/Language**: Persisted via AsyncStorage (`lib/theme.ts`, `lib/language.ts`). Theme applied via `Appearance.setColorScheme()`.

**Testing** (22 test files, Vitest):

- Config: `vitest.config.ts` aliases `react-native` → `react-native-web`, deduplicates React across monorepo workspaces
- Coverage: hooks, stores, lib — 80% statement threshold
- Test utils: `__tests__/test-utils.tsx`

#### Mobile Interaction Design

| Action              | Web                  | Mobile                                                               |
| ------------------- | -------------------- | -------------------------------------------------------------------- |
| Reorder tasks       | Drag within column   | Sorted by `orderInProject`, server-synced                            |
| Move across columns | Drag to other column | Swipe left → iOS ActionSheet / Android Modal                         |
| Change status       | Dropdown select      | Swipe right → auto-cycle (TODO→IN_PROGRESS→DONE) + haptics           |
| Edit/Delete         | Inline buttons       | `Link.Menu` native context menu + haptic feedback                    |
| Create entities     | Dialog / inline form | FormSheet modal (`presentation: "formSheet"`, `sheetGrabberVisible`) |
| Board actions       | Dropdown menu        | `Alert.alert` action sheet (edit/delete)                             |

### API Architecture (`apps/api`)

> For detailed patterns (repository, events, error handling, testing), load the `nestjs-best-practices` skill.

Project-specific conventions:

- `Service → Repository → Model (Mongoose)` — services do NOT inject `Model<T>` directly
- `UserService→UserRepository`, `BoardService→BoardRepository+EventEmitter2`, `ProjectsService→ProjectRepository+BoardService+EventEmitter2`, `TasksService→TaskRepository+ProjectsService`
- Cascade deletes via `@nestjs/event-emitter`: `Board→Projects→Tasks` (unidirectional, no `forwardRef`)
- `AllExceptionsFilter` as `APP_FILTER` — controllers do NOT use try-catch
- Tests: manual constructor instantiation with `vi.fn()` mocks, NOT `TestingModule`

## Naming Conventions

| Type                | Convention  | Example                   |
| ------------------- | ----------- | ------------------------- |
| Components (web)    | PascalCase  | `DatePicker.tsx`          |
| Components (mobile) | kebab-case  | `board-card.tsx`          |
| Utilities           | camelCase   | `dateUtils.ts`            |
| Constants           | UPPER_SNAKE | `API_ENDPOINTS.ts`        |
| Types               | PascalCase  | `UserData`, `ApiResponse` |
| Hooks (mobile)      | kebab-case  | `use-auth.ts`             |

### Export Pattern

```typescript
// packages/ui/package.json → "exports": { "./ComponentName": "./src/ComponentName/index.ts" }
// Usage: import { ComponentName } from "@repo/ui/ComponentName";
```

## Essential Commands

```bash
pnpm install          # Install all dependencies
pnpm lint --fix       # Fix lint errors
pnpm test             # Run tests
pnpm build            # Build for production
pnpm turbo clean      # Clean build cache
pnpm lint-staged      # Run linter and formatter (stage files first)
```

> [!NOTE]
> Dev server is already running via `pnpm dev`. API uses Rspack with auto hot reload.

## Known Pitfalls

> [!CAUTION]
> **next-intl Navigation**: `router.push()`/`router.replace()` from `@/i18n/navigation` auto-prepends locale. Pass locale-free paths like `"/boards"`, NOT `"/en/boards"`.

> [!CAUTION]
> **Duplicate QueryClient**: `providers/client-providers.tsx` and `providers/auth-provider.tsx` both create separate instances. Only use the one from `client-providers.tsx`.

> [!CAUTION]
> **Mobile className requires CSS wrappers**: Import from `@/lib/tw`, NOT bare React Native components. `className` on unwrapped components silently fails.

> [!CAUTION]
> **Mobile auth uses SecureStore, NOT AsyncStorage**: `apps/mobile/stores/auth.ts` uses `expo-secure-store`. Never use AsyncStorage for auth tokens. (AsyncStorage IS used for non-sensitive preferences: theme, language.)

> [!CAUTION]
> **Mobile API clients use fetchWithAuth**: All API calls go through `lib/api/fetch-with-auth.ts`. Never use raw `fetch()` for authenticated endpoints. It handles token injection, 401 auto-logout, and error parsing.

> [!CAUTION]
> **Mobile query key factories**: Hooks use structured key factories (`BOARD_KEYS`, `PROJECT_KEYS`, `TASK_KEYS`). When adding new queries, follow the existing pattern: `all → lists → list(filters) → details → detail(id)`. Invalidation must use the correct key level.

> [!CAUTION]
> **Mobile theme colors**: Never hardcode colors in mobile components. Use `className` with Tailwind tokens (`bg-background`, `text-foreground`, etc.) or `useCSSVariable("--color-*")` for inline styles. Hardcoded HSL values in header/tab bar configs are the only exception (navigation chrome).

> [!CAUTION]
> **Mobile forms use formSheet presentation**: Create/edit screens use `presentation: "formSheet"` with `sheetGrabberVisible`, `headerLeft` cancel, `headerRight` save/create. See `building-native-ui` skill for details.

> [!CAUTION]
> **Mobile useUpdateTask auto-injects lastModifier**: Do NOT pass lastModifier from components — the hook adds `user._id` automatically.

> [!CAUTION]
> **Expo latest SDK + React latest + React Compiler**: No deprecated lifecycle methods or legacy context API.

## Commit Workflow

> [!IMPORTANT]
> Follow [Conventional Commits](https://conventionalcommits.org/): `feat(scope): description` / `fix(scope): description`

1. Stage files: `git add /path/to/your/file`
2. Verify: `pnpm lint-staged && pnpm build --filter=@repo/web`
3. Fix all linter errors/warnings
4. Unstage files: `git reset`
5. Suggest commit message (never commit automatically)
