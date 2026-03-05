# Full-Stack Multi-Platform Monorepo with AI-Assisted Development: Next.js + Nest.js + React Native (Expo)

[![codecov](https://codecov.io/gh/john-data-chen/turborepo-starter-kit/graph/badge.svg?token=WvGIkvgW39)](https://codecov.io/gh/john-data-chen/turborepo-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_turborepo-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_turborepo-starter-kit)
[![CI](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml/badge.svg)](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade multi-platform monorepo demonstrating shared business logic across Web and Mobile. Built with a write-once approach for state management, validation, and types — while each platform retains full control over its UI and navigation. Showcases engineering practices, decision-making and AI-assisted optimization for senior full-stack roles.

## Architecture & Engineering Decisions

### web

<img src="./apps/web/public/assets/Screen_Recording.gif" alt="Screen Recording" width="270" height="579">

### mobile

<img src="./apps/mobile/assets/images/simulator-screenshot.png" alt="Screen Recording" width="270" height="579">

A production-grade Kanban application demonstrating monorepo architecture, test-driven development, and modern tooling practices. Originally built as a monolithic Next.js app ([next-dnd-starter-kit](https://github.com/john-data-chen/next-dnd-starter-kit)), then strategically re-architected to a decoupled frontend/backend system, and now expanded to a **multi-platform solution** with shared business logic across Web and Mobile by AI-assisted development.

### Architectural Evolution

| Aspect                | Before (Monolithic)                        | After (Decoupled Monorepo)                                            | Now (Multi-Platform)                                                | Trade-off Reasoning                                     |
| --------------------- | ------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| **Team Structure**    | Full-stack developers required             | Specialized Frontend & Backend Teams                                  | **+ Mobile Team with shared domain knowledge**                      | Teams share types/state; onboard faster via shared code |
| **Development Cycle** | Tightly coupled; one change can impact all | Independent development cycles                                        | **Web & Mobile iterate independently on shared foundations**        | Platform teams move at their own pace                   |
| **Deployment**        | Single, monolithic deployment              | Independent Frontend/Backend deployment                               | **+ OTA updates for Mobile via Expo**                               | Three independent release channels                      |
| **Scalability**       | Vertical scaling of the entire app         | Targeted horizontal scaling (e.g., scale only the API service)        | **Same API serves Web & Mobile clients**                            | Single backend; multiple frontends                      |
| **Technology Stack**  | Locked into Next.js for backend            | Flexible backend choice (Nest.js); can add more services (Go, Python) | **+ React Native (Expo) with NativeWind**                           | Best tool per platform; shared logic layer              |
| **Code Reusability**  | Limited to the Next.js app                 | Centralized `ui` & `config` packages                                  | **+ Shared `store` and `i18n` packages (types, state, validation)** | Write once for logic; platform-specific for UI          |

### Code Sharing Strategy

The monorepo shares business logic across platforms while keeping UI and navigation platform-specific:

```text
┌──────────────────────────────────────────────────────────────────┐
│                       Shared Packages                            │
│                                                                  │
│  @repo/store         @repo/i18n      @repo/ui     global-tsconfig│
│  ├── Types           ├── en.json     ├── Shadcn UI └── Base TS   │
│  ├── Zustand Stores  ├── de.json     └── Storybook    configs    │
│  └── Storage Adapter └── Locale                                  │
│       (injectable)       config                                  │
├───────────────────┬──────────────────┬───────────────────────────┤
│    apps/web       │   apps/mobile    │   apps/api                │
│    Next.js        │   Expo latest    │   Nest.js                 │
│    App Router     │   Expo Router    │   Express                 │
│    Tailwind CSS   │   Nativewind     │   Rspack                  │
│    localStorage   │   SecureStore    │   MongoDB                 │
│    next-intl      │   i18next        │   EventEmitter2           │
└───────────────────┴──────────────────┴───────────────────────────┘
```

**Shared packages** enable write-once logic across platforms:

- `@repo/store` exports a `createAuthStore()` factory with an injectable `StorageAdapter`, allowing Web to use `localStorage` and Mobile to use `expo-secure-store` — same state logic, platform-appropriate persistence.
- `@repo/i18n` provides a single source of truth for translation strings (EN/DE), consumed by `next-intl` on Web and `i18next` on Mobile. App-specific text (e.g., app name) uses `{appName}` interpolation resolved at runtime by each platform.

### Features

- Drag-and-drop Kanban with multi-project support (web) / gesture-driven interactions (mobile)
- Custom sorting and synchronization for projects and tasks
- Role-based permissions (Owner / Member)
- Task assignment with audit tracking (lastModifier)
- Search, filter by board ownership (my/team), and status filter (TODO/IN_PROGRESS/DONE)
- Theme switching (light/dark/system) with persisted preferences on both platforms
- Native UX patterns: haptic feedback, context menus, formSheet modals, ActionSheet pickers
- Pull-to-refresh, native search bar (`headerSearchBarOptions`), and platform-specific date pickers
- i18n (English, German) with device locale detection and persisted language preference

### Engineering Metrics

| Metric         | Result                                                        |
| -------------- | ------------------------------------------------------------- |
| Test Coverage  | **80%+** via Vitest (unit + integration)                      |
| Code Quality   | **SonarQube A** across Security, Reliability, Maintainability |
| Performance    | **Lighthouse 90+** on all categories                          |
| E2E Validation | Cross-browser (Chrome, Safari, Edge) via Playwright           |
| CI/CD Pipeline | GitHub Actions → SonarQube + Codecov → Vercel                 |

<img src="./apps/web/public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

### Quality Assurance

| Type              | Tool       | Rationale                                     |
| ----------------- | ---------- | --------------------------------------------- |
| Unit/Integration  | Vitest     | Faster than Jest, native ESM, simpler config  |
| E2E               | Playwright | Cross-browser support, lighter than Cypress   |
| Static Analysis   | SonarQube  | Enterprise-grade quality gates in CI          |
| Coverage Tracking | Codecov    | Automated PR integration                      |
| Documentation     | Storybook  | SSOT for UI components, auto-generated docs   |
| Visual Testing    | Storybook  | Isolated component dev, dark/light mode check |
| Accessibility     | a11y-addon | WCAG compliance checks during development     |

**Testing Strategy:**

- Unit tests target store logic, validations, and isolated components
- **Mobile**: test files covering hooks, API clients, auth service, i18n, theme, and store — with monorepo-aware Vitest config that aliases `react-native` to `react-native-web` and deduplicates React across workspaces
- E2E tests validate critical flows (auth)
- Every PR triggers the full pipeline before merge

### Frontend (Web)

| Type      | Choice                   | Rationale                                               |
| --------- | ------------------------ | ------------------------------------------------------- |
| Framework | Next.js (App Router)     | Cache Components (PPR) for mixed static/dynamic content |
| State     | Zustand (shared)         | 40% less boilerplate than Redux, simpler testing        |
| Forms     | React Hook Form + Zod    | Type-safe validation, composable schemas                |
| Database  | MongoDB + Mongoose       | Document model fits board/project/task hierarchy        |
| DnD       | dnd-kit                  | Lightweight, accessible, extensible                     |
| i18n      | next-intl                | App Router native support, auto locale routing          |
| UI        | Tailwind CSS + Shadcn/ui | Consistent design system, rapid iteration               |

### Mobile

| Type         | Choice                                         | Rationale                                                              |
| ------------ | ---------------------------------------------- | ---------------------------------------------------------------------- |
| Framework    | Expo latest                                    | Rapid iteration, OTA updates, New Architecture                         |
| Navigation   | Expo Router (typed routes)                     | File-based routing, consistent with Next.js model                      |
| Styling      | Nativewind + react-native-css                  | CSS-native theming with `useCssElement` wrappers, dark/light mode      |
| State        | Zustand (shared via `@repo/store`)             | Same auth store as web with injectable StorageAdapter                  |
| Data Fetch   | TanStack Query                                 | Same caching strategy as web, query key factories                      |
| Gestures     | Gesture Handler + Reanimated                   | Swipe-to-cycle-status, swipe-to-move, spring animations                |
| Storage      | expo-secure-store                              | Encrypted keychain/keystore for auth tokens                            |
| i18n         | i18next + expo-localization                    | Shared translations via `@repo/i18n`, persisted language pref          |
| UX Patterns  | Haptics, Context Menus, FormSheet, ActionSheet | iOS-native interactions: `Link.Menu`, `expo-haptics`, formSheet modals |
| Optimization | React Compiler (experimental)                  | Enabled via `experiments.reactCompiler` in app.json                    |

### Backend

| Type        | Choice                       | Rationale                                            |
| ----------- | ---------------------------- | ---------------------------------------------------- |
| Framework   | Nest.js (Express)            | Structured, scalable architecture for APIs           |
| Language    | TypeScript                   | Strict typing, shared types with frontend            |
| Database    | MongoDB + Mongoose           | Flexible schema, rich querying capabilities          |
| Data Access | Repository Pattern           | Abstracts Mongoose queries, improves testability     |
| Decoupling  | Event-driven (EventEmitter2) | Cascade deletes via events, no circular dependencies |
| Validation  | class-validator              | Decorator-based validation for DTOs                  |
| Auth        | Passport + JWT               | Standard, secure authentication strategies           |

### Developer Experience

| Tool       | Purpose                                           |
| ---------- | ------------------------------------------------- |
| Rspack     | Rust-based bundler for 5-10x faster than webpack  |
| Turbopack  | Rust bundler with filesystem caching for fast HMR |
| Oxlint     | 50-100x faster than ESLint, clearer diagnostics   |
| Oxfmt      | 30x faster formatter than Prettier                |
| Husky      | Pre-commit quality enforcement                    |
| Commitizen | Conventional commits for clean history            |

---

## Quick Start

### Requirements

- Node.js latest LTS version
- PNPM latest version
- Docker / OrbStack (for local MongoDB)
- **For Mobile:** iOS Simulator (Xcode) or Android Emulator (Android Studio), or [Expo Go](https://expo.dev/go) on a physical device

### Environment Configuration

Local Development:

Create a `.env (.env.test for testing)` file in the `apps/api` with the following variables:

```text
# Application Environment
# Options: default: development | production | test: for testing
NODE_ENV=development

# Authentication Secret
# Required: A secure random string for JWT token encryption
# Generate: openssl rand -base64 32
# Warning: Keep this value private and unique per environment
JWT_SECRET=[your_secret]

# Database Connection
# Format: mongodb://[username]:[password]@[host]:[port]/[database]?[options]
# Required fields:
# - username: Database user with appropriate permissions (default: root)
# - password: User's password (default: 123456)
# - host: Database host (localhost for development)
# - port: MongoDB port (default: 27017)
# - database: Database name (REQUIRED: next-project-manager)
# - options: Additional connection parameters (default: authSource=admin)
#
# ⚠️  IMPORTANT: The database name MUST be included in the URL
# If omitted, MongoDB will default to "test" database
#
# Local MongoDB example:
# DATABASE_URL="mongodb://root:123456@localhost:27017/next-project-manager?authSource=admin"
#
# MongoDB Atlas (Cloud) example:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/next-project-manager?retryWrites=true&w=majority"
```

### Setup

```bash
pnpm install

# API Environment
cp apps/api/env.example apps/api/.env

# Generate Secret and replace NEXTAUTH_SECRET in .env
openssl rand -base64 32

# Web Environment
cp apps/web/env.example apps/webs/.env

# start mongodb by docker-compose
cd /apps/api/database
docker-compose up -d

# initialize mongodb in root folder
pnpm init-db

# Basic Commands
pnpm dev                   # Development (including api, web and ios simulator)
pnpm test                  # Unit tests (including api, web and mobile)
pnpm playwright:install    # Install browsers before E2E tests for web
pnpm playwright            # E2E tests for web
pnpm storybook             # Execute Storybook for web UI components
pnpm storybook:test        # Run Storybook interaction tests for web UI components
pnpm build                 # Production build (including api, web and mobile)
```

---

## Engineering Decisions

### Version Isolation Strategy

While this monorepo shares business logic across platforms, **React and React Native maintain independent version life cycles**. This is a deliberate architectural choice:

| Concern              | Web (Next.js)                    | Mobile (Expo)                           |
| -------------------- | -------------------------------- | --------------------------------------- |
| **React Version**    | Latest stable (via PNPM catalog) | Pinned to Expo SDK requirements         |
| **Update Cadence**   | Immediate adoption               | Follows Expo SDK release cycle          |
| **Bundler**          | Turbopack                        | Metro                                   |
| **Version Coupling** | None — independent               | Locked to Expo SDK latest compatibility |

**Why:** Expo SDK releases are tightly coupled to specific React Native and React versions. Attempting to unify versions across platforms would create constant breakage. Turborepo's workspace isolation ensures each app resolves the correct dependency versions without conflict, while `@repo/store` remains version-agnostic (pure TypeScript, no React dependency).

### Storage Adapter Pattern

`@repo/store` uses dependency injection for platform persistence:

```typescript
// Web: uses localStorage (default)
const useAuthStore = createAuthStore();

// Mobile: injects expo-secure-store adapter
const useAuthStore = createAuthStore(secureStorageAdapter);
```

This pattern enables shared state logic without platform-specific imports leaking across boundaries.

### Mobile CSS Wrapper Pattern

The mobile app uses `react-native-css`'s `useCssElement` to bridge Tailwind CSS `className` props to React Native `style` objects. All UI components are imported from `lib/tw/` — never bare React Native:

```typescript
// lib/tw/index.tsx — wraps RN components with CSS-in-JS support
import { useCssElement, useNativeVariable } from "react-native-css";

export const View = (props) => useCssElement(RNView, props, { className: "style" });
export const useCSSVariable = useNativeVariable; // theme-aware CSS custom properties

// Usage in screens:
import { View, Text, Pressable } from "@/lib/tw";
<View className="flex-1 items-center justify-center bg-background">
```

This pattern enables the same Tailwind utility classes on both web and native, with dark mode reactively driven by `Appearance.setColorScheme()` and CSS `@media (prefers-color-scheme)` overrides. Theme colors defined once in `global.css` are consumed by both the Tailwind class engine and `useCSSVariable()` for inline style access.

### i18n Shared Package

`@repo/i18n` provides a single source of truth for all translation strings:

```typescript
// packages/i18n — shared translations with {appName} interpolation
import { messages, locales, defaultLocale } from "@repo/i18n";

// Web (next-intl): replaces {appName} at build time in getCachedMessages()
// Mobile (i18next): sets defaultVariables: { appName: "Project Manager" }
```

Both `next-intl` and `i18next` use `{variable}` interpolation syntax, enabling the same JSON files to work on both platforms without format conversion.

### Mobile Interaction Design

The mobile app deliberately uses **platform-appropriate interactions** instead of directly porting web drag-and-drop:

| Action                      | Web                   | Mobile                                           | Rationale                                                                         |
| --------------------------- | --------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Reorder tasks in column     | Drag & drop           | Sortable list with `orderInProject`              | Server-synced ordering, no complex drag on small screens                          |
| Move task to another column | Drag across columns   | Swipe left → iOS ActionSheet / Android Modal     | Cross-column drag is poor UX on mobile (screen too small, finger occludes target) |
| Change task status          | Click status dropdown | Swipe right → auto-cycle (TODO→IN_PROGRESS→DONE) | One-gesture with haptic feedback, similar to Apple Mail                           |
| Edit/delete task            | Click action menu     | `Link.Menu` native context menu + haptics        | iOS-native pattern via Expo Router's context menu API                             |
| Filter tasks by status      | Dropdown/sidebar      | Horizontal scrollable pill bar                   | Touch-friendly filter chips at board detail level                                 |
| Create board/project/task   | Dialog / inline form  | FormSheet presentation with sheet grabber        | iOS-native modal pattern with keyboard avoidance                                  |

This follows the principle that good cross-platform development means **same goals, platform-appropriate means** — not 1:1 feature porting.

---

## Permission Model

| Capability          | Owner | Member |
| ------------------- | ----- | ------ |
| Manage Board        | Yes   | No     |
| Create Project/Task | Yes   | Yes    |
| Edit All Content    | Yes   | No     |
| Edit Own Content    | Yes   | Yes    |
| View All Content    | Yes   | Yes    |

---

## Project Structure

```text
.github/                    # GitHub Actions workflows
.husky/                     # Husky configuration
ai-docs/                    # AI documentations including skills and prompts
apps/
├── api/                    # Nest.js API server
│   ├── __tests__/          # Unit tests (by Vitest)
│   ├── database/           # MongoDB docker-compose and initialization
│   ├── src/
│   │   ├── common/
│   │   │   ├── events/     # Domain events (BoardDeleted, ProjectDeleted)
│   │   │   ├── filters/    # Global exception filter
│   │   │   ├── interfaces/ # Shared interfaces
│   │   │   └── pipes/      # Validation pipes (ParseObjectId)
│   │   ├── constants/      # API constants and demo data
│   │   └── modules/        # Feature modules (auth, boards, projects, tasks, users)
│   │       └── */
│   │           ├── repositories/  # Repository pattern (data access layer)
│   │           ├── schemas/       # Mongoose schemas
│   │           ├── dto/           # Request/response DTOs
│   │           ├── *.service.ts   # Business logic
│   │           ├── *.controller.ts
│   │           └── *.module.ts
│   └── env.example         # Environment variables example
├── mobile/                 # React Native (Expo SDK) app
│   ├── __tests__/          # Test files: hooks, API clients, auth, i18n, theme (Vitest)
│   ├── app/                # Expo Router file-based routes (typed routes enabled)
│   │   ├── (auth)/         # Auth routes (login) — Stack, headerShown: false
│   │   ├── (tabs)/         # Tab navigation (boards, settings) + error/loading boundaries
│   │   ├── boards/         # Board detail & form screens (formSheet presentation)
│   │   ├── projects/       # Project create/edit (formSheet presentation)
│   │   └── tasks/          # Task detail & new task (formSheet presentation)
│   ├── components/         # board-card, task-card (swipe gestures), project-column, move-task-sheet
│   ├── constants/          # API_ROUTES (configurable via EXPO_PUBLIC_API_URL), APP_NAME
│   ├── hooks/              # useAuth, useBoards, useProjects, useTasks, useUsers (TanStack Query)
│   ├── lib/                # API clients (fetchWithAuth), auth service, i18n, theme, CSS wrappers
│   │   ├── api/            # board-api, project-api, task-api, user-api, fetch-with-auth
│   │   ├── auth/           # auth-service (SecureStore token management)
│   │   ├── i18n/           # i18next init with @repo/i18n shared translations
│   │   └── tw/             # CSS wrapper components (View, Text, etc.) via react-native-css
│   ├── stores/             # Auth store (SecureStore adapter via @repo/store factory)
│   ├── types/              # Environment types (EXPO_PUBLIC_API_URL)
│   └── global.css          # Tailwind theme (light/dark CSS custom properties)
├── web/                    # Next.js Web app (Cache Components enabled)
│   ├── __tests__/
│   │   ├── e2e/            # End-to-end tests (by Playwright)
│   │   └── unit/           # Unit tests (by Vitest)
│   ├── messages/           # i18n translations (en, de)
│   ├── public/             # Static files such as images
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/           # i18n locale routers
│   │   │   │   ├── (auth)/         # Authentication routes
│   │   │   │   ├── (workspace)/    # Workspace routes (RSC layout)
│   │   │   │   ├── error.tsx       # Locale-level error boundary
│   │   │   │   └── not-found.tsx   # 404 page
│   │   │   ├── actions/            # Server Actions (board, project, task)
│   │   │   └── global-error.tsx    # Global error boundary
│   │   ├── components/
│   │   │   ├── auth/               # Auth components (SignIn, UserAuthForm)
│   │   │   ├── kanban/
│   │   │   │   ├── board/          # Board + BoardContext + DnD hooks
│   │   │   │   ├── project/        # Project column components
│   │   │   │   └── task/           # Task card components
│   │   │   └── layout/             # App shell (Sidebar, Header, etc.)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── i18n/                   # i18n config (routing, navigation)
│   │   ├── lib/
│   │   │   ├── api/                # API clients + TanStack Query hooks
│   │   │   ├── auth/               # Auth service
│   │   │   └── config/             # Environment config
│   │   ├── providers/              # React Query + Theme providers
│   │   ├── stores/                 # Zustand stores (board, project, task slices)
│   │   ├── types/                  # Type definitions + Zod schemas
│   │   └── proxy.ts                # Middleware (i18n + auth guard)
│   └── types/              # Type definitions
packages/
├── global-tsconfig/        # Base TypeScript configuration
├── i18n/                   # Shared translations (@repo/i18n)
│   └── src/
│       ├── locales/
│       │   ├── en.json     # English translations (single source of truth)
│       │   └── de.json     # German translations
│       └── index.ts        # Locale config, Messages type export
├── store/                  # Shared state & types (@repo/store)
│   └── src/
│       ├── types.ts        # Domain types (Board, Task, User, etc.)
│       ├── auth-store.ts   # Auth store factory with StorageAdapter
│       ├── storage.ts      # StorageAdapter interface
│       └── workspace-types.ts  # Shared workspace interface
└── ui/                     # Shared UI components (@repo/ui)
    ├── .storybook/         # Storybook configuration
    ├── src/components/ui/  # Shadcn UI components + storybooks
    └── styles/             # Global styles
```

---

## Storybook: Component Documentation & Visual Testing

Storybook serves as the Single Source of Truth (SSOT) for UI components, providing living documentation that stays synchronized with the codebase.

[Live Demo of Storybook](https://turborepo-starter-kit-storybook.vercel.app/)

### Implementation Highlights

| Feature                   | Implementation                                | Value                                        |
| ------------------------- | --------------------------------------------- | -------------------------------------------- |
| **MDX Documentation**     | Rich component guides with usage examples     | Reduces onboarding time for new team members |
| **Interaction Testing**   | Automated behavior tests using play functions | Catches UI regressions before E2E stage      |
| **Accessibility Testing** | WCAG validation via @storybook/addon-a11y     | Ensures compliance from development start    |
| **Theme Testing**         | Dark/Light mode verification                  | Maintains design consistency across themes   |

### Component Test Coverage

| Component  | Documentation                                                | Interaction Tests                                           | Scenarios        |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ---------------- |
| **Button** | Usage patterns, A11y guidelines, Keyboard shortcuts          | Click, Keyboard navigation, Disabled state, Multi-variant   | 4 test scenarios |
| **Input**  | Form integration, Validation patterns, Type variants         | Text input, Email validation, Focus/Blur, Keyboard controls | 7 test scenarios |
| **Card**   | Composition patterns, Real-world examples, Layout guides     | N/A (Presentational)                                        | N/A              |
| **Badge**  | Semantic usage, Color meanings, Accessibility best practices | N/A (Presentational)                                        | N/A              |

---

## AI-Augmented Engineering Workflow

This project demonstrates a "Human-in-the-Loop" architecture where AI tools are orchestrated to amplify engineering impact. The focus is not just on code generation, but on **architectural leverage, rigorous quality assurance, and accelerated velocity**.

### Orchestration & Agency

I utilize a suite of specialized AI tools, each assigned specific roles to mimic a high-performing engineering team structure.

| Role              | Tool                                                                    | Responsibility                      | Impact                                                                                                                                   |
| :---------------- | :---------------------------------------------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Architect**     | [Claude Code](https://github.com/anthropics/claude-code)                | System design & complex refactoring | Handles multi-file architectural changes with deep context awareness, perfect for making plans for other AI tools.                       |
| **Plan Executor** | [Kilo Code](https://github.com/Kilo-Org/kilocode)                       | Code writing                        | Follow the plan by Architect, implement functionality and refactor using a faster and cheaper models coming from MiniMax, Z.AI and Kimi. |
| **QA**            | [Gemini CLI](https://github.com/google-gemini/gemini-cli)               | Writing test cases                  | Gemini Flash is the cheapest option in top models, perfect for writing test cases.                                                       |
| **PR Reviewer**   | [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist) | Automated PR Review                 | Enforces code standards and catches potential bugs before human reviewer.                                                                |

**MCP (Model Context Protocol) Servers**

MCP enables AI tools to interact directly with development infrastructure, eliminating context-switching overhead:

| Server                                                                       | Integration Point     | Workflow Enhancement                                                                         |
| ---------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Browser state         | Allows AI agents to directly inspect and manipulate browser state via the DevTools Protocol. |
| [context7-mcp](https://github.com/upstash/context7)                          | Documentation         | Get current library docs for AI agents                                                       |
| [nextjs-mcp](https://nextjs.org/docs/app/guides/mcp)                         | Framework diagnostics | Allow AI agents direct access to dev server logs and routes                                  |
| [playwright-mcp](https://github.com/microsoft/playwright-mcp)                | E2E testing           | Allow AI agents direct access to run e2e tests                                               |

**AI Skills** (in `ai_docs/skills/`)

Skills extend AI capabilities for specialized tasks. Each skill contains instructions and resources that AI assistants can use. Skills are organized by platform:

**AI Optimization Skills** (`ai_docs/skills/ai-optimization/`)

Based on [karpathy-guidelines](https://github.com/forrestchang/andrej-karpathy-skills)

| Skill                 | Purpose                                          | When to Use                                                                                                                                                                    |
| :-------------------- | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `karpathy-guidelines` | Behavioral guidelines to reduce AI coding errors | Writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria (Thinking before coding) |

**API Skills** (`ai_docs/skills/api/`)

Based on and refined from [nestjs-best-practices](https://github.com/davila7/claude-code-templates/tree/main/cli-tool/components/skills/development/nestjs-expert)

| Skill                   | Purpose                        | When to Use                                                                     |
| :---------------------- | :----------------------------- | :------------------------------------------------------------------------------ |
| `nestjs-best-practices` | NestJS architecture & patterns | Writing, reviewing, or refactoring NestJS code (Mongoose, Vitest, DI, security) |

**Mobile Skills** (`ai_docs/skills/mobile/`)

Based on [expo-skills](https://github.com/expo/skills)

| Skill                  | Purpose                          | When to Use                                                            |
| :--------------------- | :------------------------------- | :--------------------------------------------------------------------- |
| `building-native-ui`   | Expo Router UI guide             | Building screens, navigation, animations, native tabs, or styling      |
| `expo-api-routes`      | Expo Router API routes           | Creating server-side API endpoints with EAS Hosting                    |
| `expo-dev-client`      | Dev client builds & TestFlight   | Custom native code, Apple targets, or third-party native modules       |
| `expo-tailwind-setup`  | Tailwind + NativeWind setup      | Setting up or configuring Tailwind CSS styling in Expo                 |
| `native-data-fetching` | Networking & data fetching       | Any API call, fetch, caching, offline support, or auth token handling  |
| `upgrading-expo`       | Expo SDK upgrades                | Upgrading Expo SDK versions or fixing dependency compatibility issues  |
| `use-dom`              | DOM components for web-in-native | Using web libraries on native, migrating web code, Canvas/WebGL embeds |

**Web Skills** (`ai_docs/skills/web/`)

Based on [next-skills](https://github.com/vercel-labs/next-skills) and [vercel agent-skills](https://github.com/vercel-labs/agent-skills)

| Skill                         | Purpose                     | When to Use                                                                   |
| :---------------------------- | :-------------------------- | :---------------------------------------------------------------------------- |
| `next-best-practices`         | Next.js best practices      | Writing, reviewing, or refactoring Next.js code                               |
| `next-cache-components`       | Next.js 16 cache components | Implementing `use cache`, PPR, cacheLife, cacheTag, or updateTag              |
| `vercel-composition-patterns` | React composition patterns  | Refactoring components, building reusable component APIs, compound components |
| `vercel-react-best-practices` | React performance rules     | Writing, reviewing, or refactoring React/Next.js code for performance         |
| `web-design-guidelines`       | UI/UX accessibility audits  | "Review my UI", "Check accessibility", "Audit design"                         |

**AI Guidelines** (`ai_docs/PROMPTS.md`)

Project-specific instructions for AI assistants including repository structure, commands, file conventions, and example workflows. Adhering to these guidelines reduces AI hallucinations and increases the accurate utilization of skills and MCP servers by approximately 40-60%. AI tools should reference this file first when working on this project.

**How to Use:**

This is an example of how to use prompts and skills in Claude Code, you should check the documentation of other AI tools for more details.

- Create a folder named `.claude`
- Copy skills you need from `ai_docs/skills/` to `.claude/skills/`
- Copy or create a symbolic link of `PROMPTS.md` to your AI tool's context file location
  | AI Tool | Target Path |
  | ----------- | ------------------- |
  | Claude Code | `[root-folder]/CLAUDE.md` |
- Restart the Claude Code or other AI tools

### Measurable Impact

By treating AI as an integrated part of the stack, this project achieves:

- **Velocity**: 5-10x faster implementation of boilerplate and standard patterns.
- **Quality**: Higher test coverage (80%+) through AI-generated test scaffolding.
- **Learning**: Rapid mastery of new tools (Rspack, Playwright, Storybook...and more) via AI-guided implementation.
- **Cost**: Lower costs by using AI agents skills to reduce tokens and match the best practice in frontend.
- **Focus**: Shifted engineering time from syntax to system architecture and user experience.

---

## Modern Tooling Adoption

Part of my engineering approach involves continuously evaluating emerging tools and making data-driven adoption decisions. This section documents tools I've integrated after hands-on evaluation, demonstrating measurable impact on developer productivity.

### Oxlint (Rust-based Linter)

| Aspect           | Details                                               |
| ---------------- | ----------------------------------------------------- |
| Status           | **Production** - core linting enabled                 |
| Performance      | 50-100x faster than ESLint                            |
| DX Improvement   | Clearer error messages, simpler config than ESLint 9+ |
| Migration Impact | Removed 10 ESLint packages from dependency tree       |

Type-aware rules are available but kept in evaluation for this project. [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | [Type-Aware Linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html)

### Oxfmt (Rust-based Formatter)

| Aspect      | Details                                          |
| ----------- | ------------------------------------------------ |
| Status      | **Evaluation** - enabled for evaluation          |
| Performance | 30x faster than Prettier with instant cold start |

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter)

### Turbopack + Filesystem Caching

| Aspect      | Details                                    |
| ----------- | ------------------------------------------ |
| Status      | **Production** - default in Next.js latest |
| Performance | Near-instant HMR, incremental compilation  |
| Caching     | Filesystem caching persists artifacts      |

[Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) | [FS Caching](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache)

### Rspack (Nest.js Backend)

| Aspect      | Details                                                 |
| ----------- | ------------------------------------------------------- |
| Status      | **Production** - replaced Webpack for Nest.js           |
| Performance | 5-10x faster builds than Webpack                        |
| Benefit     | Dramatic reduction in dev server startup and build time |

[Rspack](https://github.com/web-infra-dev/rspack)

### React Compiler

| Aspect    | Details                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| Status    | **Production on Mobile** (Expo `experiments.reactCompiler`), **deferred on Web**               |
| Trade-off | Web: +5-10% Lighthouse score vs +30-40% build time; Mobile: no measurable penalty              |
| Decision  | Enabled on mobile where Metro handles compilation; deferred on web due to Turbopack build cost |

[React Compiler](https://react.dev/learn/react-compiler)

---

## Live Demo Constraints

| Aspect             | Current State                       | Production Recommendation           |
| ------------------ | ----------------------------------- | ----------------------------------- |
| **Hosting Region** | Hong Kong (free tier)               | Multi-region CDN deployment         |
| **Response Time**  | Variable latency for non-Asia users | Edge functions or regional backends |
| **Translations**   | EN complete, DE partial             | Professional localization service   |

The demo deployment uses free-tier infrastructure to minimize costs. Production deployments should implement proper CDN and regional optimization.
