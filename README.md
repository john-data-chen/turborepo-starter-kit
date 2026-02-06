# Full-Stack Monorepo Architecture: Next.js + Nest.js with 80%+ Test Coverage

[![codecov](https://codecov.io/gh/john-data-chen/turborepo-starter-kit/graph/badge.svg?token=WvGIkvgW39)](https://codecov.io/gh/john-data-chen/turborepo-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_turborepo-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_turborepo-starter-kit)
[![CI](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml/badge.svg)](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A portfolio project demonstrating production-grade architecture, test-driven development, and data-driven tooling decisions. Built to showcase engineering practices and decision-making for senior full-stack roles.

## Architecture & Engineering Decisions

<img src="./apps/web/public/assets/Screen_Recording.gif" alt="Screen Recording" width="270" height="579">

A production-grade Kanban application demonstrating monorepo architecture, test-driven development, and modern tooling practices. Originally built as a monolithic Next.js app ([next-dnd-starter-kit](https://github.com/john-data-chen/next-dnd-starter-kit)), then strategically re-architected to a decoupled frontend/backend system.

### Architectural Evolution

| Aspect                | Before (Monolithic)                        | After (Decoupled Monorepo)                                                | Trade-off Reasoning                                  |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Team Structure**    | Full-stack developers required             | **Specialized Frontend & Backend Teams**                                  | Enables parallel development; teams own their domain |
| **Development Cycle** | Tightly coupled; one change can impact all | **Independent development cycles**                                        | Reduces cross-team blocking; faster iteration        |
| **Deployment**        | Single, monolithic deployment              | **Independent Frontend/Backend deployment**                               | Lower-risk releases; isolated failure domains        |
| **Scalability**       | Vertical scaling of the entire app         | **Targeted horizontal scaling** (e.g., scale only the API service)        | Cost-effective resource allocation                   |
| **Technology Stack**  | Locked into Next.js for backend            | **Flexible backend choice (Nest.js)**; can add more services (Go, Python) | Future-proofs architecture; best tool for each job   |
| **Code Reusability**  | Limited to the Next.js app                 | **Centralized `ui` & `config` packages**                                  | Enforces consistency; DRY across applications        |

### Features

- Drag-and-drop Kanban with multi-project support
- Custom sorting and synchronization for projects (new)
- Role-based permissions (Owner / Member)
- Task assignment with audit tracking
- Search and filter
- Theme switching (light/dark)
- Responsive design (mobile → desktop)
- i18n (English, German)

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
- E2E tests validate critical flows (auth)
- Every PR triggers the full pipeline before merge

### Frontend

| Type      | Choice                   | Rationale                                        |
| --------- | ------------------------ | ------------------------------------------------ |
| Framework | Next.js (App Router)     | SSG for static pages, SSR for dynamic content    |
| State     | Zustand                  | 40% less boilerplate than Redux, simpler testing |
| Forms     | React Hook Form + Zod    | Type-safe validation, composable schemas         |
| Database  | MongoDB + Mongoose       | Document model fits board/project/task hierarchy |
| DnD       | dnd-kit                  | Lightweight, accessible, extensible              |
| i18n      | next-intl                | App Router native support                        |
| UI        | Tailwind CSS + Shadcn/ui | Consistent design system, rapid iteration        |

### Backend

| Type       | Choice             | Rationale                                   |
| ---------- | ------------------ | ------------------------------------------- |
| Framework  | Nest.js (Express)  | Structured, scalable architecture for APIs  |
| Language   | TypeScript         | Strict typing, shared types with frontend   |
| Database   | MongoDB + Mongoose | Flexible schema, rich querying capabilities |
| Validation | class-validator    | Decorator-based validation for DTOs         |
| Auth       | Passport + JWT     | Standard, secure authentication strategies  |

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

### Environment Configuration

Local Development:

Create a `.env (.env.test for testing)` file in the project root with the following variables:

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

# Environment
cp apps/api/env.example apps/api/.env

# Generate Secret and replace NEXTAUTH_SECRET in .env
openssl rand -base64 32

# start mongodb by docker-compose
cd /apps/api/database
docker-compose up -d

# initialize mongodb in root folder
pnpm init-db

# Run
pnpm dev                   # Development
pnpm test                  # Unit tests
pnpm playwright:install    # Install browsers before E2E tests
pnpm playwright            # E2E tests
pnpm storybook             # Execute Storybook
pnpm storybook:test        # Run Storybook interaction tests
pnpm build                 # Production build
```

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

## 📖 Detailed Technical Documentation

### Project Structure

```text
.github/ # GitHub Actions workflows
.husky/ # Husky configuration
ai-docs/ # AI documentations including skills and prompts
apps/
├── api/ # Nest.js API server
│   ├── __tests__/ # Unit tests (by Vitest)
│   ├── database/ # MongoDB docker-compose and initialization
│   ├── src/
│   │   ├── common/ # Nest pipe
│   │   ├── constants/ # Nest constants
│   │   ├── controllers/ # Nest controllers
│   │   └── modules/ # Nest modules
│   └── env.example # Environment variables example
├── web/ # Next.js Web app
│   ├── __tests__/
│   │   ├── e2e/ # End-to-end tests (by Playwright)
│   │   └── unit/ # Unit tests (by Vitest)
│   ├── .github/ # GitHub Actions workflows
│   ├── .husky/ # Husky configuration
│   ├── database/ # MongoDB docker-compose and initialization
│   ├── messages/ # i18n translations
│   ├── public/ # Static files such as images
│   ├── src/
│   │   └── app/ # Next.js App routes
│   │       ├── [locale] # i18n locale routers
│   │       ├── page.tsx # Root page
│   │       ├── layout.tsx # Layout component
│   │       ├── not-found.tsx # 404 page
│   │       ├── (auth)/ # Authentication routes
│   │            └── login/ # Login page
│   │       └── (workspace)/ # Workspace routes
│   │            └── boards/ # Kanban Overview routes
│   │                └── [boardId]/ # Board
│   ├────── components/ # Custom React components
│   ├────── constants/ # Application-wide constants
│   ├────── hooks/ # Custom React hooks
│   ├────── i18n/ # i18n configs
│   ├────── lib/
│   │       ├── api/ # API clients with auth handling
│   │       ├── auth/ # Authentication services
│   │       └── config/ # Environment configuration
│   ├────── providers/ # React context providers
│   ├────── stores/ # Zustand state management
│   ├────── types/ # Type definitions
│   └─────  proxy.ts # the middleware for handling API requests
└────────── env.example # Environment variables example
packages/
├── global-tsconfig # global tsconfig
└── ui # Shared UI components
    ├────── .storybook/ # configs of storybook
    ├────── src/components/ui # Shadcn UI components / component storybooks
    └────── styles/ # Global styles
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

## 🤖 AI-Augmented Engineering Workflow

This project demonstrates a "Human-in-the-Loop" architecture where AI tools are orchestrated to amplify engineering impact. The focus is not just on code generation, but on **architectural leverage, rigorous quality assurance, and accelerated velocity**.

### 🚀 Orchestration & Agency

I utilize a suite of specialized AI tools, each assigned specific roles to mimic a high-performing engineering team structure.

| Role              | Tool                                                                    | Responsibility                      | Impact                                                                                                                                                           |
| :---------------- | :---------------------------------------------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architect**     | [Claude Code](https://github.com/anthropics/claude-code)                | System design & complex refactoring | Handles multi-file architectural changes with deep context awareness, perfect for making plans for other AI tools.                                               |
| **Plan Executor** | [Kilo Code](https://github.com/Kilo-Org/kilocode)                       | Code writing                        | Follow the plan by Architect, implement functionality and refactor using a faster and cheaper model such as Grok Code Fast 1, MiniMax M2 and Mistral Devstral 2. |
| **QA**            | [Gemini CLI](https://github.com/google-gemini/gemini-cli)               | Writing test cases                  | Gemini 3 Pro is the cheapest option in top models, perfect for writing test cases.                                                                               |
| **PR Reviewer**   | [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist) | Automated PR Review                 | Enforces code standards and catches potential bugs before human reviewer.                                                                                        |

**MCP (Model Context Protocol) Servers**

MCP enables AI tools to interact directly with development infrastructure, eliminating context-switching overhead:

| Server                                                                                                    | Integration Point     | Workflow Enhancement                                                |
| --------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)                              | Browser state         | Debug without leaving the editor                                    |
| [context7-mcp](https://github.com/upstash/context7)                                                       | Documentation         | Current library docs during development                             |
| [nextjs-mcp](https://nextjs.org/docs/app/guides/mcp)                                                      | Framework diagnostics | Direct access to build errors and routes                            |
| [sequential-thinking-mcp](https://www.npmjs.com/package/@modelcontextprotocol/server-sequential-thinking) | Problem decomposition | Structured approach for complex decisions                           |
| [playwright-mcp](https://github.com/microsoft/playwright-mcp)                                             | E2E testing           | Add e2e tests by AI based on Behavior-Driven Development guidelines |

**AI Skills** (in `ai_docs/skills/`)

Skills extend AI capabilities for specialized tasks. Each skill contains instructions and resources that AI assistants can use.

| Skill                                | Purpose                             | When to Use                                                                |
| :----------------------------------- | :---------------------------------- | :------------------------------------------------------------------------- |
| `vercel-composition-patterns`        | React composition patterns          | "Refactoring components", "Build reusable components", "Review components" |
| `vercel-react-best-practices`        | 45+ React/Next.js performance rules | Writing, reviewing, or refactoring React code                              |
| `vercel-react-native-best-practices` | 16+ React Native performance rules  | Writing, reviewing, or refactoring React Native code                       |
| `web-design-guidelines`              | UI/UX accessibility audits          | "Review my UI", "Check accessibility", "Audit design"                      |

Based on [vercel agent-skills](https://github.com/vercel-labs/agent-skills)

**AI Guidelines** (`ai_docs/PROMPTS.md`)

Project-specific instructions for AI assistants including repository structure, commands, file conventions, and example workflows. AI tools should reference this file first when working on this project.

**How to Use:**

This is an example of how to use prompts and skills in Claude Code, you should check the documentation of other AI tools for more details.

- create a folder named `.claude`
- then copy skills folder from `ai_docs/skills/` to `.claude`
- Copy `ai_docs/PROMPTS.md` to root directory, then rename it to `CLAUDE.md`
- restart the Claude Code
- AI assistants will use the skills when they are needed

### 📈 Measurable Impact

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

Type-aware rules are available but kept in evaluation for this project. [Oxlint Docs](https://oxc.rs/blog/2025-06-10-oxlint-stable.html)

### Oxfmt (Rust-based Formatter)

| Aspect      | Details                                          |
| ----------- | ------------------------------------------------ |
| Status      | **Evaluation** - enabled for evaluation          |
| Performance | 30x faster than Prettier with instant cold start |

[Oxfmt Docs](https://oxc.rs/docs/guide/usage/formatter)

### Turbopack + Filesystem Caching

| Aspect      | Details                                    |
| ----------- | ------------------------------------------ |
| Status      | **Production** - default in Next.js latest |
| Performance | Near-instant HMR, incremental compilation  |
| Caching     | Filesystem caching persists artifacts      |

[Turbopack Docs](https://nextjs.org/docs/app/api-reference/turbopack) | [FS Caching](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache)

### Rspack (Nest.js Backend)

| Aspect      | Details                                                 |
| ----------- | ------------------------------------------------------- |
| Status      | **Production** - replaced Webpack for Nest.js           |
| Performance | 5-10x faster builds than Webpack                        |
| Benefit     | Dramatic reduction in dev server startup and build time |

[Rspack Docs](https://rspack.dev/guide/start/introduction)

### React Compiler

| Aspect    | Details                                                                    |
| --------- | -------------------------------------------------------------------------- |
| Status    | **Evaluated, deferred**                                                    |
| Trade-off | +5-10% Lighthouse score vs +30-40% build time                              |
| Decision  | Build time cost outweighs marginal performance gain for this project scope |

[React Compiler Docs](https://react.dev/learn/react-compiler)

---

## Live Demo Constraints

| Aspect             | Current State                       | Production Recommendation           |
| ------------------ | ----------------------------------- | ----------------------------------- |
| **Hosting Region** | Hong Kong (free tier)               | Multi-region CDN deployment         |
| **Response Time**  | Variable latency for non-Asia users | Edge functions or regional backends |
| **Translations**   | EN complete, DE partial             | Professional localization service   |

The demo deployment uses free-tier infrastructure to minimize costs. Production deployments should implement proper CDN and regional optimization.
