# AI Guidelines

## AI Assistant Behavioral Framework

- **Check MCP servers and skills list before task execution**: Always check the MCP servers and skills list before starting a task to ensure you have the necessary tools and knowledge to complete the task. If you know a MCP server or skill that is not installed and enabled but they might be useful for the task, remind the user and ask for next steps.
- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

> [!TIP]
> For React/Next.js performance optimization, use the `vercel-react-best-practices` skill.
> For UI/UX review and accessibility, use the `web-design-guidelines` skill.
> For React composition patterns that scale, use the `composition-patterns` skill.
> Use `next-devtools-mcp` to help you finish the task if it is installed and you need to.
> Use `context7-mcp` to get more information about the packages if it is installed and you need to.

## Project Overview

### Repository Structure

| Type        | Package                    | Description               |
| ----------- | -------------------------- | ------------------------- |
| **App**     | `apps/api`                 | Nest.js (Express)         |
| **App**     | `apps/web`                 | Next.js AppRouter         |
| **Package** | `packages/ui`              | Shadcn UI Shared UI       |
| **Package** | `packages/global-tsconfig` | TypeScript configurations |

#### Shadcn UI Components

The Shadcn UI components are in `packages/ui/components/ui`. They are a UI library - modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first, only modify Shadcn components as a last resort.

## Essential Commands

### Daily Development

```bash
pnpm install                          # Install all dependencies
pnpm upgrade                          # Upgrade all dependencies
pnpm build --filter=@repo/api         # Build for production
```

> [!NOTE]
> Dev server is already running via `pnpm dev`, no need to start it again.

### Debugging & Verification

Run after all modifications are complete and ready for commit:

```bash
pnpm turbo clean                      # Clean build cache
git add /path/to/your/file.ts         # Stage file for linting
pnpm lint-staged                      # Run linter and prettier
```

## Technology Stack

- Check `package.json` for versions before starting.
- use `node -v` to check node version if you need it

| Category            | Technology                                      |
| ------------------- | ----------------------------------------------- |
| **Runtime**         | Node.js latest (check with `node -v`)           |
| **Framework**       | Next.js (App Router) + React                    |
| **Language**        | TypeScript (strict mode)                        |
| **Styling**         | TailwindCSS                                     |
| **Package Manager** | PNPM (not npm/yarn)                             |
| **Monorepo**        | Turborepo                                       |
| **Unit Test**       | Vitest                                          |
| **State**           | Zustand (global), TanStack Query (server state) |
| **Forms**           | React Hook Form + Zod                           |

### State Management Quick Reference

| Use Case        | Solution                                     |
| --------------- | -------------------------------------------- |
| Component State | `useState` (simple) / `useReducer` (complex) |
| Context API     | 2-3 levels deep, domain-specific             |
| Global State    | Zustand stores by feature                    |
| Server State    | TanStack Query                               |
| Form State      | React Hook Form + Zod                        |

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
