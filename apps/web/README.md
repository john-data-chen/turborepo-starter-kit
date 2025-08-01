# Production-Ready Next.js Project Management Tool Template | Drag & Drop Support <br>

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)

## ✨ Why Choose This Template:

<img src="./public/assets/Screen_Recording.gif" alt="Screen Recording" width="270" height="579">

The **Enterprise-grade Next.js template** with 80%+ test coverage, drag & drop functionality, and WAI-ARIA accessibility. It is designed for saving time while adhering to best practices and including:

- 🚀 Production-Ready: Enterprise-level architecture with full TypeScript support
- 💪 Professional Setup: CI/CD, Testing, Code Quality tools pre-configured and pass the SonarQube Quality Check
- 🎯 Developer-Friendly: Clear documentation and best practices built-in
- 📝 Full Functional: Drag & Drop, Search and Filter, User Permission Management, Multi Kanban and Project Support
- 🌐 Internationalization (i18n): English and German
- 🎨 Modern UX: Theme Switcher, Responsive Design for mobile, tablet, and desktop
- 💾 Persistent data: via MongoDB

---

**Love this template?**
If you like original template (Frontend and Backend are both built byNext.js), don't forget to [give it a star](https://github.com/john-data-chen/next-dnd-starter-kit) today!

Every star motivates me to deliver more high-quality templates. 🚀

---

**Key Accomplishments**:

- Responsive Design: Ensures optimal user experience across all devices, reflecting a product-centric development approach.
- Reliable User Experience: Validated the critical login flow across all major browsers (Chrome, Safari, Edge) on both desktop and mobile using Playwright E2E tests.
- Live Demo Deployment (Vercel): Provides immediate access to a functional application, showcasing practical deployment skills.
- Elite Web Performance & Quality (Lighthouse 90+): Achieved scores of 90+ across Performance, Accessibility, Best Practices, and SEO in Google Lighthouse, ensuring a top-tier user experience and technical excellence.

<img src="./public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

---

## 🛠️ Technical Decision

- **Frontend**: [Next](https://nextjs.org/docs/app/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) - modern UI with strong type safety and server-side rendering (using SSG in login page for better performance, SSR in workspace pages for dynamic content)
- **Build**: [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [Husky](https://github.com/typicode/husky) - they are the 1st quality gate: automated code quality checks and style formatting during commit, preventing problems into codebase and make consistent code style in team work
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/) - consistent, responsive, and scalable styling, enabling rapid and maintainable UI development
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) - they are the 2nd quality gate: easier to setup and faster execution than Jest and Cypress, chosen for their efficiency and comprehensive testing capabilities
- **Internationalization(i18n)**: [Next-intl](https://next-intl.dev/) - internationalization (i18n) support for Next.js applications
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - minimal and testable global state management, 40% code reduction compared to Redux
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) - composable form logic and schema validation.
- **Drag and Drop**: [dnd-kit](https://dndkit.com/) - A lightweight, performant, accessible and extensible drag & drop toolkit

---

### Project Structure

```text
__tests__/
│   ├── e2e/ # End-to-end tests (by Playwright)
│   └── unit/ # Unit tests (by Vitest)
.github/ # GitHub Actions workflows
.husky/ # Husky configuration
database/ # MongoDB docker-compose and initialization
messages/ # i18n translations
public/ # Static files such as images
src/
├── app/ # Next.js App routes
│   └── [locale] # i18n locale routers
│        ├── page.tsx # Root page
│        ├── layout.tsx # Layout component
│        ├── not-found.tsx # 404 page
│        ├── (auth)/ # Authentication routes
│             └── login/ # Login page
│        └── (workspace)/ # Workspace routes
│             └── boards/ # Kanban Overview routes
│                 └── [boardId]/ # Board
├── components/ # Reusable React components
│   └── ui/ # Shadcn UI components
├── constants/ # Application-wide constants
├── hooks/ # Custom React hooks
├── i18n/ # i18n configs
├── lib/
│   ├── db/ # Database functions
│   ├── auth.ts # Authentication functions
│   ├── store.ts # State management functions
│   └── utils.ts # tailwindcss utils
├── middleware.ts
├── models/ # Database models
├── styles/ # Global styles
├── types/ # Type definitions
└── env.example # Environment variables example
```

## Experimental Tools

### React Compiler

- status: disabled (enable it will increase build time 30~40%, so I disable it)
- benefit: It can increase the performance score in lighthouse test 5~10% (not significant)

## Known Issues & Limitations

### German Translations

This is a demo project, and I know little of German, so errors of translations might not be fixed in the near future.

### UI library

- **Radix UI Ref Warning**:
  - Issue: Function components cannot be given refs warning in Dialog components
  - Impact: Development warning only, no production impact
  - Solution: Keep using `asChild` as per Radix UI docs, warning can be safely ignored
  - Reason: Internal implementation detail of Radix UI

- **Radix UI ARIA Warning**:
  - Issue: Blocked aria-hidden on a <body> element warning in Dialog components
  - Impact: Development warning only, no production impact
  - Solution: Can be safely ignored as most modern browsers handle this correctly
  - Reason: Internal implementation of Radix UI's Dialog component

### Server

- **Slow response from server**:
  - Server Region: Hong Kong
  - Issue: Sometimes Server response is slow, especially for users are not in Asia
  - Status: The resource of free tier is limited and no plan of CDN, it won't be fix in the near future

---

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
