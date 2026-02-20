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

### 🚨 Universal Optimization Skills (CHECK FIRST, in `ai_docs/skills/ai-optimization/`)

| Condition (when the task involves...)                                                                                               | Skill to Use          |
| :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **ANY coding task** (writing, refactoring, fixing bugs). **ALWAYS** load this skill first to ensure high-quality, surgical changes. | `karpathy-guidelines` |

### API Skills (`ai_docs/skills/api/`)

| Condition (when the task involves...)                                                    | Skill to Use            |
| :--------------------------------------------------------------------------------------- | :---------------------- |
| NestJS modules, DI, guards, pipes, interceptors, Mongoose queries, testing, architecture | `nestjs-best-practices` |

### Mobile Skills (`ai_docs/skills/mobile/`)

| Condition (when the task involves...)                                       | Skill to Use           |
| :-------------------------------------------------------------------------- | :--------------------- |
| Expo screens, navigation, animations, native tabs, styling, layout patterns | `building-native-ui`   |
| Server-side API endpoints in Expo Router, EAS Hosting, Cloudflare Workers   | `expo-api-routes`      |
| Custom dev client builds, TestFlight distribution, native modules           | `expo-dev-client`      |
| Setting up or configuring Tailwind CSS / NativeWind in Expo                 | `expo-tailwind-setup`  |
| Any network request, API call, fetch, caching, offline support, auth tokens | `native-data-fetching` |
| Upgrading Expo SDK, fixing dependency conflicts, New Architecture migration | `upgrading-expo`       |
| Running web code on native via webview, Canvas/WebGL, web library migration | `use-dom`              |

### Web Skills (`ai_docs/skills/web/`)

| Condition (when the task involves...)                                              | Skill to Use                  |
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
| **App**     | `apps/mobile`              | React Native (Expo 54) app                                     |
| **Package** | `packages/global-tsconfig` | TypeScript configurations                                      |
| **Package** | `packages/i18n`            | Shared i18n translations (EN/DE), locale config, Messages type |
| **Package** | `packages/store`           | Domain types, Zustand stores, StorageAdapter pattern           |
| **Package** | `packages/ui`              | Shadcn UI Shared UI (web-only, not used by mobile)             |

#### Shadcn UI Components

The Shadcn UI components are in `packages/ui/components/ui`. They are a UI library - modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first, only modify Shadcn components as a last resort.

#### Shared i18n Package (`packages/i18n`)

Single source of truth for EN/DE translations. Uses `{appName}` interpolation for app-specific titles:
- **Web** (next-intl): Resolves `{appName}` via `interpolateAppName()` in `get-cached-messages.ts` → `"Next Project Manager"`
- **Mobile** (i18next): Resolves `{appName}` via `defaultVariables: { appName: "Project Manager" }` in i18n init
- Both next-intl and i18next support `{variable}` single-brace syntax natively
- Translations live in `packages/i18n/src/locales/en.json` and `de.json`
- Exports: `messages`, `locales`, `defaultLocale`, `Locale` type, `Messages` type

### Mobile Architecture (`apps/mobile`)

#### Mobile Tech Stack

| Category       | Technology                                                           |
| -------------- | -------------------------------------------------------------------- |
| Framework      | Expo 54, React Native 0.81.5                                        |
| Navigation     | expo-router 6 (file-based routing)                                   |
| Styling        | NativeWind 5 (preview) + TailwindCSS 4.1 + react-native-css         |
| State          | Zustand 5 (via @repo/store) + TanStack Query v5                     |
| Auth Storage   | expo-secure-store (NOT AsyncStorage)                                 |
| i18n           | i18next + react-i18next + expo-localization (imports from @repo/i18n) |
| DnD            | react-native-draggable-flatlist (within-column reorder only)         |
| Animations     | react-native-reanimated 4                                            |

#### NativeWind CSS Wrappers

Mobile uses `useCssElement()` wrappers in `lib/tw/index.tsx` because `globalClassNamePolyfill: false` in Metro config. Import styled components from `@/lib/tw`:

```typescript
import { View, Text, ScrollView, Pressable, TextInput, Link } from "@/lib/tw";
// These support className prop → maps to style via react-native-css
<View className="flex-1 bg-background p-4 gap-2" />
```

Do NOT use `className` on bare React Native components — only the wrapped versions support it.

#### StorageAdapter Pattern (Cross-Platform Auth)

`@repo/store` exports `createAuthStore(adapter)` factory. Each platform provides its own adapter:
- **Web**: `localStorage` adapter in `apps/web/src/stores/auth.ts`
- **Mobile**: `expo-secure-store` adapter in `apps/mobile/stores/auth.ts`

#### Mobile Interaction Design (Hybrid DnD)

Mobile does NOT replicate web's full drag-and-drop kanban. Instead uses platform-appropriate interactions:

| Action              | Web                    | Mobile                                                        |
| ------------------- | ---------------------- | ------------------------------------------------------------- |
| Reorder tasks       | Drag within column     | Long press + drag (react-native-draggable-flatlist)           |
| Move across columns | Drag to other column   | Swipe left → ActionSheet project picker                       |
| Change status       | Dropdown select        | Swipe right → auto-cycle status                               |
| Edit/Delete         | Inline buttons         | Long press → context menu                                     |

#### Mobile File Conventions

- File names: **kebab-case** (e.g., `board-card.tsx`, `use-auth.ts`)
- Routes in `app/` directory only — never co-locate components in `app/`
- Inline styles with NativeWind, NOT `StyleSheet.create`
- Use `borderCurve: "continuous"` for rounded corners
- Use `contentInsetAdjustmentBehavior="automatic"` on ScrollView/FlatList
- Use `process.env.EXPO_OS` instead of `Platform.OS`

### API Architecture (`apps/api`)

#### Repository Pattern

Services do NOT inject Mongoose `Model<T>` directly. Each module has a `repositories/` folder:

```
Service → Repository → Model (Mongoose)
```

- `UserService` → `UserRepository`
- `BoardService` → `BoardRepository` + `EventEmitter2`
- `ProjectsService` → `ProjectRepository` + `BoardService` + `EventEmitter2`
- `TasksService` → `TaskRepository` + `ProjectsService`

#### Event-Driven Cascade Deletes

Circular dependencies are avoided using `@nestjs/event-emitter`. Deletion cascades via events:

```
Board deleted → emit("board.deleted")
  → ProjectsService.handleBoardDeleted() → emit("project.deleted") per project + deleteByBoardId
    → TasksService.handleProjectDeleted() → deleteByProjectId
```

Dependency direction is unidirectional: `Tasks → Projects → Boards` (no `forwardRef`).

#### Centralized Error Handling

`AllExceptionsFilter` is registered as `APP_FILTER` in `app.module.ts`. Controllers do NOT use try-catch blocks.

#### Testing Pattern

Unit tests use **manual constructor instantiation** with `vi.fn()` mocks, NOT NestJS `TestingModule`:

```typescript
// Correct: mock repository directly
const taskRepository = { create: vi.fn(), findById: vi.fn() };
const service = new TasksService(taskRepository as any, projectsService as any);

// Wrong: do NOT use getModelToken() — services no longer accept Model<T>
```

## Essential Commands

### Daily Development

```bash
pnpm install                          # Install all dependencies
pnpm lint --fix                       # Fix lint errors
pnpm test                             # Run tests
pnpm build                            # Build for production
```

> [!NOTE]
> Dev server is already running via `pnpm dev`, no need to start it again.

### Debugging & Verification

```bash
pnpm turbo clean                      # Clean build cache
git add /path/to/your/file.ts         # Stage file for linting
pnpm lint-staged                      # Run linter and formatter
```

## Technology Stack

| Category               | Technology                                      |
| ---------------------- | ----------------------------------------------- |
| **Runtime**            | Node.js latest (check with `node -v`)           |
| **Frontend Framework** | Next.js (App Router) + React                    |
| **Backend Framework**  | Nest.js (Express)                               |
| **Mobile Framework**   | React Native (Expo 54), expo-router 6           |
| **Language**           | TypeScript (strict mode)                        |
| **Styling**            | TailwindCSS (web), NativeWind 5 + react-native-css (mobile) |
| **Package Manager**    | PNPM (not npm/yarn)                             |
| **Monorepo**           | Turborepo                                       |
| **Unit Test**          | Vitest                                          |
| **E2E Test**           | Playwright                                      |
| **State**              | Zustand (global), TanStack Query (server state) |
| **Forms**              | React Hook Form + Zod                           |

## Naming Conventions

| Type                  | Convention  | Example                   |
| --------------------- | ----------- | ------------------------- |
| Components (web)      | PascalCase  | `DatePicker.tsx`          |
| Components (mobile)   | kebab-case  | `board-card.tsx`          |
| Utilities             | camelCase   | `dateUtils.ts`            |
| Constants             | UPPER_SNAKE | `API_ENDPOINTS.ts`        |
| Types                 | PascalCase  | `UserData`, `ApiResponse` |
| Hooks (mobile)        | kebab-case  | `use-auth.ts`             |

### Export Pattern

```typescript
// packages/ui/package.json
{
  "exports": {
    "./ComponentName": "./src/ComponentName/index.ts"
  }
}

// Usage in apps
import { ComponentName } from "@repo/ui/ComponentName";
```

## Known Pitfalls

> [!CAUTION]
> **next-intl Navigation**: `router.push()` / `router.replace()` from `@/i18n/navigation` (created by `createNavigation(routing)`) **automatically prepends the locale prefix**. Do NOT manually add locale to paths — pass locale-free paths like `"/boards"`, not `"/en/boards"`. Using `getLocalePath()` with next-intl router causes double-locale bugs (e.g. `/en/en/boards` → 404).

> [!CAUTION]
> **Duplicate QueryClient**: `providers/client-providers.tsx` and `providers/auth-provider.tsx` both create separate `QueryClient` instances. This defeats TanStack Query's caching strategy. Only use the QueryClient from `client-providers.tsx`.

> [!CAUTION]
> **Mobile className requires CSS wrappers**: Do NOT use `className` on bare React Native components (`View`, `Text`, etc.). Always import from `@/lib/tw` which wraps components with `useCssElement()`. Using `className` on unwrapped components silently fails — styles won't apply.

> [!CAUTION]
> **Mobile auth uses SecureStore, NOT AsyncStorage**: Token storage must use `expo-secure-store` for security. The `StorageAdapter` in `apps/mobile/stores/auth.ts` uses `SecureStore.getItemAsync/setItemAsync/deleteItemAsync`. Do NOT import or use `@react-native-async-storage/async-storage` for auth tokens.

## Debugging Checklist

> [!NOTE]
> API uses Rspack with auto hot reload - no restart needed after modifications.

1. **Read Actual Source**: Always read component source before assumptions
2. **Trace Data Flow**: User interaction → component state → props → parent state
3. **Check useEffect**: Look for state resets or conflicting side effects
4. **Controlled vs Uncontrolled**: Identify hybrid components with internal + prop state
5. **State Location**: Verify if issue is in child component logic vs parent state

```bash
# Check component usage patterns
grep -r "ComponentName" apps/forms/src/
```

## Commit Workflow

> [!IMPORTANT]
> Follow [Conventional Commits](https://conventionalcommits.org/) specification.
> Format: `feat(scope): description` / `fix(scope): description`

**After completing changes:**

1. Stage files: `git add /path/to/your/file`
2. Verify: `pnpm lint-staged && pnpm build --filter=@repo/web`
3. Fix all linter errors/warnings
4. Unstage files: `git reset`
5. Suggest commit message (never commit automatically)

## Quality Checklist

- [ ] All commands run without errors
- [ ] TypeScript strict mode compliance
- [ ] Follows existing code patterns
- [ ] Proper component export structure
- [ ] Conventional commit messages
- [ ] No lint warnings or build errors
