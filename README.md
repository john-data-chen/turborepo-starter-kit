# Turborepo Starter Kit

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a test project, a playground for me to test and import new tools into my stack.
It has many issues and problems, and might not be fixed quickly, when it is ready, I will update README.md.

---

## Tech Stack

- Next.js (it comes from my previous project: [next-dnd-starter-kit](https://github.com/john-data-chen/next-dnd-starter-kit))
- Turborepo (for monorepo)
- NestJS (for backend)
- Rspack (for faster build)
- OxLint (for faster linting)
  ...etc

---

## 🚀 Getting Started

- Press **Use this template** to create a new repository.
- Clone the repository to your local machine.

### Requirements

- Node.JS v22.x, please use [NVM](https://github.com/nvm-sh/nvm) or [FNM](https://github.com/Schniz/fnm) to install
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

### 📊 Testing Strategy

- Unit Tests: Focused on critical store logic, complex form validations, and isolated component behaviors, ensuring granular code reliability.
- Test Coverage: Maintained above 80%+ (verified via npx vitest run --coverage), reflecting a commitment to robust code coverage without sacrificing test quality.
- E2E Tests: Critical user flows, such as the Login page, are validated end-to-end using Playwright, simulating real user interactions to guarantee system integrity.
- Cross-browser Testing Strategy: Ensures consistent functionality and user experience across a carefully selected range of desktop and mobile browsers based on market share, mitigating compatibility issues.

---

## Experimental Tools

### Oxlint

- status: enabled
- benefit:
  - 50~100 times faster than ESLint (it can lint this small project in 15ms, it has more potential in big projects with thousands of files)
  - easier to setup
  - clearer instructions showing how to fix each issue
  - many ESLint packages can be removed (in my case 10 packages)

---

## To-Do

- [ ] Add a refresh after edit a task
- [ ] Add a refresh after delete a task
- [ ] Add Vercel deployment
- [ ] Update README.md in root
- [ ] Update README.md in `apps/web`
- [ ] Update README.md in `apps/api`
- [ ] Update unit tests for NextJS in `apps/web`
- [ ] Write unit tests for NestJS in `apps/api`
- [ ] Update e2e tests for NextJS in `apps/web`
- [ ] Add github actions for CI

---

## Known Issues & Limitations

### Server

- **Slow response from server**:
  - Server Region: Hong Kong
  - Issue: Sometimes Server response is slow, especially for users are not in Asia
  - Reason:
    - The resource of free tier is limited.
    - In this monorepo project, the backend is separated from the original NextJS App into NestJS app, the response between two services is longer.
  - Solution: I don't have budget for paid tier or CDN, so it won't be fixed in the near future.

---

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
