# Full-Stack Monorepo Architecture: Next.js + Nest.js with 80%+ Test Coverage

[![codecov](https://codecov.io/gh/john-data-chen/turborepo-starter-kit/graph/badge.svg?token=WvGIkvgW39)](https://codecov.io/gh/john-data-chen/turborepo-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_turborepo-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_turborepo-starter-kit)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml/badge.svg)](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

### Core Capabilities

- **Kanban System**: Drag & drop task management with multi-project support
- **Permission System**: Role-based access control (Owner/Member)
- **Internationalization**: Pre-configured i18n (EN & DE)
- **Accessibility**: WAI-ARIA compliant components

---

### Key Accomplishments

| Area             | Achievement                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Architecture** | Decoupled monolithic Next.js into separate frontend/backend, enabling independent scaling |
| **API Design**   | Nest.js with dependency injection, modular structure, and comprehensive validation        |
| **Performance**  | Lighthouse 90+ across all metrics through optimized SSG/SSR strategies                    |
| **Testing**      | 80%+ coverage with Vitest; E2E flows validated across Chrome, Safari, Edge via Playwright |
| **CI/CD**        | Automated pipeline with quality gates; live deployment on Vercel                          |

<img src="./apps/web/public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

---

## 🛠️ Technical Decision

### Monorepo

[Turborepo](https://turborepo.org/) - A high-performance build system for JavaScript and TypeScript codebases. It was chosen to manage this monorepo for several key reasons:

- Faster, Smarter Builds: Turborepo dramatically speeds up development and CI/CD pipelines through advanced caching. It caches the output of tasks, ensuring code is never re-built or re-tested unnecessarily. This leads to near-instantaneous builds for unchanged code, a critical advantage for both developer productivity and deployment frequency.
- Simplified Monorepo Management: It provides a streamlined developer experience for managing shared packages (/packages), configurations (ESLint, TypeScript), and scripts from a single repository. This simplifies dependency management, promotes code reuse, and ensures consistency across the entire application stack (frontend and backend).
- Intelligent Task Scheduling: With its understanding of the dependency graph, Turborepo optimizes task execution by running them in the correct order and parallelizing where possible. This efficient scheduling minimizes idle time and further accelerates the entire build process.

### Frontend

- **Framework**: [Next.js](https://nextjs.org/docs/app/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) - modern UI with strong type safety and server-side rendering (using SSG in login page for better performance, SSR in workspace pages for dynamic content)
- **Build**: [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [Husky](https://github.com/typicode/husky) - they are the 1st quality gate: automated code quality checks and style formatting during commit, preventing problems into codebase and make consistent code style in team work
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/) - consistent, responsive, and scalable styling, enabling rapid and maintainable UI development
- **Design System Workshop**: [Storybook](https://storybook.js.org/) - Integrated into the shared Shadcn UI component library via Turborepo. It serves as the Single Source of Truth (SSOT) for all UI components, ensuring design-to-code consistency. I utilized the Storybook Test Runner for interaction testing, establishing a pre-commit visual quality gate that significantly reduces UI bugs before they reach the E2E stage.
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) - they are the 2nd quality gate: easier to setup and faster execution than Jest and Cypress, chosen for their efficiency and comprehensive testing capabilities
- **Internationalization(i18n)**: [Next-intl](https://next-intl.dev/) - internationalization (i18n) support for Next.js applications
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - minimal and testable global state management, 40% code reduction compared to Redux
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) - composable form logic and schema validation.
- **Drag and Drop**: [dnd-kit](https://dndkit.com/) - A lightweight, performant, accessible and extensible drag & drop toolkit

### Backend

- **Framework**: [Nest.js](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/) modern server-side application framework with strong type safety and performance
- **Build**: [Rspack](https://rspack.dev/) high-performance, Rust-based bundler designed for interoperability with the Webpack ecosystem. It delivers a 5-10x faster build speed compared to Webpack, dramatically reducing both development server startup and production build times.
- **Database**: [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/) modern database with strong type safety and performance
- **Authentication**: [Passport](https://www.passportjs.org/), [JWT](https://jwt.io/) modern authentication with strong type safety and performance
- **Testing**: [Vitest](https://vitest.dev/) modern testing with strong type safety and performance
- **CI/CD**: [GitHub Actions](https://github.com/features/actions), [SonarQube](https://sonarcloud.io/), they are the 3rd quality gate: every pull request triggers a comprehensive pipeline, enforcing code quality gates and ensuring production-readiness through automated testing and deployment

---

## 🚀 Getting Started

- Press **Use this template** to create a new repository.
- Clone the repository to your local machine.

### Requirements

- Node.JS version >= 24.11.0 (the newest version of 24.x LTS), please use [NVM](https://github.com/nvm-sh/nvm) or [FNM](https://github.com/Schniz/fnm) to install
- [PNPM](https://pnpm.io/) 10.x

### Database

- In production and CI, I use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
- In local development, I use [Docker Compose](https://docs.docker.com/compose/) in folder **database**, you need to have [Docker](https://www.docker.com/) or [OrbStack](https://orbstack.dev/) installed.

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

Production and CI:

Create environment variables in Vercel or GitHub project settings. **Ensure the database name is included in the DATABASE_URL** (e.g., `/next-project-manager` in the connection string).

### Useful Commands

```bash
# Install dependencies
pnpm install

# rename env.example in apps/api to .env
mv apps/api/env.example apps/api/.env

# Generate Secret and replace NEXTAUTH_SECRET in .env
openssl rand -base64 32

# start mongodb by docker-compose
cd /apps/api/database
docker-compose up -d

# initialize mongodb
pnpm init-db

# stop mongodb (in database folder)
cd /apps/api/database
docker-compose down

# Start development server
pnpm dev

# Lint fix
pnpm lint

# Format code
pnpm format

# Build
pnpm build

# Storybook
pnpm storybook
```

---

## 🔐 Permission System

### Core Concepts

- Board can have multiple projects, it is the biggest container
- Project can have multiple tasks, it is the smallest container
- Each board has one owner and multiple members
- Tasks can be assigned to any member
- All modifications of a task are tracked with last modified user

### User Roles & Permissions

| Role         | Create Board | Delete Board | Edit All Projects | Delete Project (Cascade Tasks) | Create Project | Create Task | Edit All Tasks | Edit Own Task | Delete All Tasks | Delete Own Task | View All Projects & Tasks |
| ------------ | ------------ | ------------ | ----------------- | ------------------------------ | -------------- | ----------- | -------------- | ------------- | ---------------- | --------------- | ------------------------- |
| Board Owner  | ✔️           | ✔️           | ✔️                | ✔️                             | ✔️             | ✔️          | ✔️             | ✔️            | ✔️               | ✔️              | ✔️                        |
| Board Member | ✖️           | ✖️           | ✖️                | ✖️                             | ✔️             | ✔️          | ✖️             | ✔️            | ✖️               | ✔️              | ✔️                        |

> Note:
>
> - Board Owner has all permissions, including creating, deleting, and editing all projects and tasks.
> - Board Member can only create projects and tasks, and can only edit and delete their own projects and tasks, but can view all content.

### Task Operations

- Task creator and assignee can edit task
- Only owner of board, owner of project and creator of task can delete tasks
- Task status: To Do → In Progress → Done

---

## 📖 Detailed Technical Documentation

### Project Structure

```text
.github/ # GitHub Actions workflows
.husky/ # Husky configuration
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
│   │       ├── db/ # Database functions
│   │       ├── auth.ts # Authentication functions
│   │       ├── store.ts # State management functions
│   │       └── utils.ts # tailwindcss utils
│   ├────── middleware.ts
│   ├────── models/ # Database models
│   ├────── types/ # Type definitions
│   └────── env.example # Environment variables example
packages/
├── global-tsconfig # global tsconfig
├── linter-config # linter config
└── ui # Shadcn ui components
    ├────── .storybook/ # configs of storybook
    ├────── src/components/ui # Shadcn UI components / component storybooks
    └────── styles/ # Global styles
```

---

### 📊 Testing Strategy

- Unit Tests: Focused on critical store logic, complex form validations, and isolated component behaviors, ensuring granular code reliability.
- Test Coverage: Maintained above 80%+ (verified via npx vitest run --coverage), reflecting a commitment to robust code coverage without sacrificing test quality.
- E2E Tests: Critical user flows, such as the Login page, are validated end-to-end using Playwright, simulating real user interactions to guarantee system integrity.
- Cross-browser Testing Strategy: Ensures consistent functionality and user experience across a carefully selected range of desktop and mobile browsers based on market share, mitigating compatibility issues.

---

## Storybook: Component Documentation & Visual Testing

Storybook serves as the Single Source of Truth (SSOT) for UI components, providing living documentation that stays synchronized with the codebase.

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

### Interaction Testing Examples

```typescript
// Button Click Interaction Test
export const ClickInteraction: Story = {
  play: async ({ args, canvas, step }) => {
    const button = within(canvas).getByRole('button', { name: /click me/i })

    await step('Verify button renders correctly', async () => {
      await expect(button).toBeInTheDocument()
      await expect(button).toBeEnabled()
    })

    await step('Click button and verify callback', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })
  }
}
```

### Running Storybook

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook for production
pnpm storybook:build

# Run Storybook interaction tests
pnpm storybook:test
```

### Quality Gates Enabled

- **Pre-commit**: Interaction tests run via Storybook Test Runner
- **CI Pipeline**: Visual regression detection before merge
- **Documentation**: Auto-synchronized with component changes

---

## AI-Assisted Development Workflow

This project integrates AI tools into a structured development workflow, focusing on measurable productivity gains while maintaining code quality. Each tool was evaluated based on context awareness, workflow integration, and production stability.

### Integrated Toolchain

**Development Environments**

| Tool                                                     | Purpose                          | Integration Benefit                                   |
| -------------------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| [Claude Code](https://github.com/anthropics/claude-code) | AI-assisted coding and debugging | Deep codebase understanding with autonomous workflows |
| [Windsurf](https://windsurf.com/)                        | AI-native IDE                    | Inline suggestions with full context awareness        |
| [Zed](https://zed.dev/)                                  | High-performance editor          | Fast iteration with integrated AI assistance          |
| [Kilo Code](https://github.com/Kilo-Org/kilocode)        | VS Code extension                | AI capabilities in familiar environment               |

**MCP (Model Context Protocol) Servers**

MCP enables AI tools to interact directly with development infrastructure, eliminating context-switching overhead:

| Server                                                                                                | Integration Point     | Workflow Enhancement                      |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------- |
| [chrome-devtools](https://github.com/anthropics/anthropic-quickstarts)                                | Browser state         | Debug without leaving the editor          |
| [context7](https://github.com/upstash/context7)                                                       | Documentation         | Current library docs during development   |
| [Next.js](https://nextjs.org/docs/app/guides/mcp)                                                     | Framework diagnostics | Direct access to build errors and routes  |
| [sequential-thinking](https://www.npmjs.com/package/@modelcontextprotocol/server-sequential-thinking) | Problem decomposition | Structured approach for complex decisions |
| [playwright](https://github.com/microsoft/playwright-mcp)                                             | E2E test automation   | Browser-aware test authoring              |

**CI/CD Integration**

| Tool                                                                    | Stage     | Purpose                                |
| ----------------------------------------------------------------------- | --------- | -------------------------------------- |
| [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist) | PR Review | Automated code review and PR summaries |

### Tool Selection Criteria

1. **Context awareness**: Must understand project structure, not just individual files
2. **Workflow integration**: Enhances existing practices without requiring process changes
3. **Production stability**: Reliable for daily professional use
4. **Security**: Appropriate handling of code and credentials

### Productivity Patterns

- **Debugging**: MCP-integrated browser tools provide real-time state inspection without context-switching
- **Documentation**: Context7 serves current library documentation inline, reducing research time
- **Code review**: AI-assisted PR analysis ensures consistent review coverage
- **Refactoring**: Autonomous AI tools handle multi-file changes with dependency awareness

---

## Experimental Tools

### Oxlint and Type-Aware plug-in

- status: enabled
- benefit:
  - 50~100 times faster than ESLint (it can lint this small project in 1.5 seconds, it has more potential in big projects with thousands of files)
  - easier to setup (compared to ESLint 9+)
  - clearer instructions showing how to fix each issue
  - many ESLint packages can be removed (in my case 10 packages)
- note: Oxlint is in a stable version, and many companies have used it in production for a long time.
  But Type-Aware plug-in is still in a preview version. It is not recommended to use it in production.

#### Introductions

- [Oxlint](https://oxc.rs/blog/2025-06-10-oxlint-stable.html)
- [Oxlint Type-Aware Preview](https://oxc.rs/blog/2025-08-17-oxlint-type-aware.html)

### Oxfmt

- status: enabled
- benefit: Significantly faster (about 50 times) than Prettier, with near-instant cold startup times.(it can format this small project in 800ms, it has more potential in big projects with thousands of files). It is not recommended to use it in production, still in preview version.
- [introduction](https://oxc.rs/docs/guide/usage/formatter)

### Turbopack

- location: apps/web (Next.js)
- enabled in default (Next.js 16)
- benefit: the Rust-based successor of webpack by Vercel, offers near-instantaneous server startup and lightning-fast Hot Module Replacement (HMR). This is achieved through its incremental architecture, which caches function-level computations, ensuring we only build what's necessary.
- [introduction](https://nextjs.org/docs/app/api-reference/turbopack)

#### Turbopack File System Caching (beta)

- location: apps/web (Next.js)
- status: enabled
- benefit: Turbopack now supports filesystem caching in development, storing compiler artifacts on disk between runs for significantly faster compile times across restarts, especially in large projects.
- [introduction](https://nextjs.org/blog/next-16#turbopack-file-system-caching-beta)

### Rspack

- location: apps/api
- status: enabled
- benefit: Rspack is a high-performance, Rust-based bundler designed for interoperability with the Webpack ecosystem. It delivers a 5-10x faster build speed compared to Webpack, dramatically reducing both development server startup and production build times.
- [introduction](https://rspack.rs/guide/start/introduction)

### Prettier oxc plugin

- status: disabled (it is conflict with vs code auto formatting, since this is a small project, the speed difference is not significant)
- benefit: Increase Prettier formatting speed
- [introduction](https://www.npmjs.com/package/@prettier/plugin-oxc)

### React Compiler

- location: apps/web (Next.js)
- status: disabled (enable it will increase build time 30~40%, so I disable it)
- benefit: It can increase the performance score in lighthouse test 5~10% (not significant)
- [introduction](https://react.dev/learn/react-compiler)

---

## Deployment Notes

### Live Demo Constraints

| Aspect             | Current State                       | Production Recommendation           |
| ------------------ | ----------------------------------- | ----------------------------------- |
| **Hosting Region** | Hong Kong (free tier)               | Multi-region CDN deployment         |
| **Response Time**  | Variable latency for non-Asia users | Edge functions or regional backends |
| **Translations**   | EN complete, DE partial             | Professional localization service   |

The demo deployment uses free-tier infrastructure to minimize costs. Production deployments should implement proper CDN and regional optimization.

---

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
