# AI Guidelines

## AI Assistant Behavioral Framework

- **Check MCP/skills before execution**: Verify available tools; suggest missing ones if useful.
- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

> [!TIP]
> Use skills: `vercel-react-best-practices` (performance), `web-design-guidelines` (UI/UX), `vercel-composition-patterns` (React patterns), `vercel-react-native-best-practices` (React Native performance rules).
> Use MCPs: `next-devtools-mcp`, `context7-mcp` if installed and enabled.

## Project Overview

### Repository Structure

| Type        | Package                    | Description                                          |
| ----------- | -------------------------- | ---------------------------------------------------- |
| **App**     | `apps/api`                 | Nest.js (Express)                                    |
| **App**     | `apps/web`                 | Next.js AppRouter                                    |
| **App**     | `apps/mobile`              | React Native (Expo) app                              |
| **Package** | `packages/global-tsconfig` | TypeScript configurations                            |
| **Package** | `packages/store`           | Domain types, Zustand stores, StorageAdapter pattern |
| **Package** | `packages/ui`              | Shadcn UI Shared UI                                  |

#### Shadcn UI Components

The Shadcn UI components are in `packages/ui/components/ui`. They are a UI library - modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first, only modify Shadcn components as a last resort.

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
| **Mobile Framework**   | React Native (Expo)                             |
| **Language**           | TypeScript (strict mode)                        |
| **Styling**            | TailwindCSS                                     |
| **Package Manager**    | PNPM (not npm/yarn)                             |
| **Monorepo**           | Turborepo                                       |
| **Unit Test**          | Vitest                                          |
| **E2E Test**           | Playwright                                      |
| **State**              | Zustand (global), TanStack Query (server state) |
| **Forms**              | React Hook Form + Zod                           |

## Naming Conventions

| Type       | Convention  | Example                   |
| ---------- | ----------- | ------------------------- |
| Components | PascalCase  | `DatePicker.tsx`          |
| Utilities  | camelCase   | `dateUtils.ts`            |
| Constants  | UPPER_SNAKE | `API_ENDPOINTS.ts`        |
| Types      | PascalCase  | `UserData`, `ApiResponse` |

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
