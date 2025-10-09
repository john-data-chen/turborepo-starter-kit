# Production-Ready Turborepo Project Management Tool Template | Drag & Drop Support <br>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml/badge.svg)](https://github.com/john-data-chen/turborepo-starter-kit/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Why Choose This Template:

<img src="./apps/web/public/assets/Screen_Recording.gif" alt="Screen Recording" width="270" height="579">

The **Enterprise-grade Turborepo template** with drag & drop functionality, and WAI-ARIA accessibility. It is designed for saving time while adhering to best practices and including:

- 🚀 Production-Ready: Enterprise-level architecture with full TypeScript support
- 💪 Professional Setup: CI/CD, Testing, Code Quality tools pre-configured and pass the SonarQube Quality Check
- 🎯 Developer-Friendly: Clear documentation and best practices built-in
- 📝 Full Functional: Drag & Drop, Search and Filter, User Permission Management, Multi Kanban and Project Support
- 🌐 Internationalization (i18n): English and German

---

**Love this template?**
If you like original template (Frontend and Backend are both built by Next.js), don't forget to [give it a star](https://github.com/john-data-chen/next-dnd-starter-kit) today!

Every star motivates me to deliver more high-quality templates. 🚀

---

**Key Accomplishments**:

- Responsive Design: Ensures optimal user experience across all devices, reflecting a product-centric development approach.
- Reliable User Experience: Validated the critical login flow across all major browsers (Chrome, Safari, Edge) on both desktop and mobile using Playwright E2E tests.
- Live Demo Deployment (Vercel): Provides immediate access to a functional application, showcasing practical deployment skills.
- Elite Web Performance & Quality (Lighthouse 90+): Achieved scores of 90+ across Performance, Accessibility, Best Practices, and SEO in Google Lighthouse, ensuring a top-tier user experience and technical excellence.

<img src="./apps/web/public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

---

## 🛠️ Technical Decision

### Frontend

- **Framework**: [Next](https://nextjs.org/docs/app/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) - modern UI with strong type safety and server-side rendering (using SSG in login page for better performance, SSR in workspace pages for dynamic content)
- **Build**: [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [Husky](https://github.com/typicode/husky) - they are the 1st quality gate: automated code quality checks and style formatting during commit, preventing problems into codebase and make consistent code style in team work
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/) - consistent, responsive, and scalable styling, enabling rapid and maintainable UI development
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) - they are the 2nd quality gate: easier to setup and faster execution than Jest and Cypress, chosen for their efficiency and comprehensive testing capabilities
- **Internationalization(i18n)**: [Next-intl](https://next-intl.dev/) - internationalization (i18n) support for Next.js applications
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - minimal and testable global state management, 40% code reduction compared to Redux
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) - composable form logic and schema validation.
- **Drag and Drop**: [dnd-kit](https://dndkit.com/) - A lightweight, performant, accessible and extensible drag & drop toolkit

### Backend

- **Framework**: [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/): modern server-side application framework with strong type safety and performance
- **Build**: [Rspack](https://rspack.dev/): high-performance, Rust-based bundler designed for interoperability with the Webpack ecosystem. It delivers a 5-10x faster build speed compared to Webpack, dramatically reducing both development server startup and production build times.
- **Database**: [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/): modern database with strong type safety and performance
- **Authentication**: [Passport](https://www.passportjs.org/), [JWT](https://jwt.io/): modern authentication with strong type safety and performance
- **Testing**: [Vitest](https://vitest.dev/): modern testing with strong type safety and performance
- **CI/CD**: [GitHub Actions](https://github.com/features/actions): modern CI/CD with strong type safety and performance

---

## 🚀 Getting Started

- Press **Use this template** to create a new repository.
- Clone the repository to your local machine.

### Requirements

- Node.JS version >= 22.11.0 (the newest version of 22.x LTS), please use [NVM](https://github.com/nvm-sh/nvm) or [FNM](https://github.com/Schniz/fnm) to install
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
NEXTAUTH_SECRET=[your_secret]

# Database Connection
# Format: mongodb://[username]:[password]@[host]:[port]/[database]?[options]
# Required fields:
# - username: Database user with appropriate permissions (default: root)
# - password: User's password (default: 123456)
# - host: Database host (localhost for development)
# - port: MongoDB port (default: 27017)
# - database: Database name (default: next-project-manager)
# - options: Additional connection parameters (default: authSource=admin)
# Example: DATABASE_URL="mongodb://root:123456@localhost:27017/next-project-manager?authSource=admin"
```

Production and CI:

Create environment variables in Vercel or GitHub project settings.

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
├── api/ # NestJS API server
│   ├── __tests__/ # Unit tests (by Vitest)
│   ├── database/ # MongoDB docker-compose and initialization
│   ├── src/
│   │   ├── common/ # Nest pipe
│   │   ├── constants/ # Nest constants
│   │   ├── controllers/ # Nest controllers
│   │   └── modules/ # Nest modules
│   └── env.example # Environment variables example
├── web/ # NextJS Web app
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
    └────── styles/ # Global styles
```

---

### 📊 Testing Strategy

- Unit Tests: Focused on critical store logic, complex form validations, and isolated component behaviors, ensuring granular code reliability.
- E2E Tests: Critical user flows, such as the Login page, are validated end-to-end using Playwright, simulating real user interactions to guarantee system integrity.
- Cross-browser Testing Strategy: Ensures consistent functionality and user experience across a carefully selected range of desktop and mobile browsers based on market share, mitigating compatibility issues.

---

## AI Tools

I am using AI tools to help our team improve the quality of code and the efficiency of development. This project is one of the playgrounds for AI tools.

### Editor with AI

- [Windsurf](https://windsurf.com/)
- [Zed](https://zed.dev/)

### VS code extension

- [Kilo Code](https://github.com/Kilo-Org/kilocode)

### Command line interface

- [gemini-cli](https://github.com/google-gemini/gemini-cli)
- [claude-code](https://github.com/anthropics/claude-code)

### MCP

- [chrome-devtools](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [context7](https://github.com/upstash/context7)

### GitHub Action (code review, PR summary)

- [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist)

### Documentation

- [NotebookLM](https://notebooklm.google.com/)

## Experimental Tools

### Oxlint and Type-Aware plug-in

- status: enabled
- benefit:
  - 50~100 times faster than ESLint (it can lint this small project in 1.5 seconds, it has more potential in big projects with thousands of files)
  - easier to setup
  - clearer instructions showing how to fix each issue
  - many ESLint packages can be removed (in my case 10 packages)
- note: Oxlint is in a stable version, and I have used it in production for a long time. But Type-Aware plug-in is still in a preview version. It is not recommended to use it in production, and it is a experimental in this project.

#### Introductions

- [Oxlint](https://oxc.rs/blog/2025-06-10-oxlint-stable.html)
- [Oxlint Type-Aware Preview](https://oxc.rs/blog/2025-08-17-oxlint-type-aware.html)

### Turbopack

- location: apps/web (NextJS)
- status: enabled (dev and build mode)
- benefit: the Rust-based successor of webpack by Vercel, offers near-instantaneous server startup and lightning-fast Hot Module Replacement (HMR). This is achieved through its incremental architecture, which caches function-level computations, ensuring we only build what's necessary.
- [introduction](https://nextjs.org/docs/app/api-reference/turbopack)

### Rspack

- location: apps/api (NestJS)
- status: enabled
- benefit: Rspack is a high-performance, Rust-based bundler designed for interoperability with the Webpack ecosystem. It delivers a 5-10x faster build speed compared to Webpack, dramatically reducing both development server startup and production build times.
- [introduction](https://rspack.rs/guide/start/introduction)

### Prettier oxc plugin

- status: disabled (it is conflict with vs code auto formatting, since this is a small project, the speed difference is not significant)
- benefit: Increase Prettier formatting speed
- [introduction](https://www.npmjs.com/package/@prettier/plugin-oxc)

### React Compiler

- location: apps/web (NextJS)
- status: disabled (enable it will increase build time 30~40%, so I disable it)
- benefit: It can increase the performance score in lighthouse test 5~10% (not significant)
- [introduction](https://react.dev/learn/react-compiler)

---

## To-Do

- [x] Add CI/CD
- [ ] Add tests in apps/api to make overall coverage over 80%
- [ ] Fix the issues of CRUD in project and tasks
- [ ] Add tests in apps/wev to make overall coverage over 80%

---

## Known Issues & Limitations

### The errors / code smells of Oxlint and Type-Aware plug-in

After I enabled new rules of Oxlint and Type-Aware plug-in, linter finds more code smells in the project, but warnings and errors of linter are not issues, no effect in functional.
Cleaning technical debt is a long term plan, it is impossible to finish at once. I will clean by small steps each time.

### German Translations

This is a demo project, and I know little of German, so errors of translations might not be fixed in the near future.

### Server

- **Slow response from server**:
  - Server Region: Hong Kong
  - Issue: Sometimes Server response is slow, such as you can't search user when you add a task then find the assigner, especially for users are not in Asia (in local dev server, I tested it works fine)
  - Reason:
    - The resource of free tier is limited.
    - In this monorepo project, the backend is separated from the original NextJS App into NestJS app, the response between two services is longer.
  - Solution: I don't have plan for a demo project to upgrade paid tier or CDN, so it won't be fixed in the near future.

---

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
