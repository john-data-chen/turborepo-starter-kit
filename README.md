# Turborepo Starter Kit

This is a test project, a playground for me to test and import new tools into my stack.
It has many issues and problems, and might not be fixed quickly, when it is ready, I will update README.md.

## Tech Stack

- Next.js (it comes from my previous project: [next-dnd-starter-kit](https://github.com/john-data-chen/next-dnd-starter-kit))
- Turborepo (for monorepo)
- NestJS (for backend)
- Rspack (for faster build)
- OxLint (for faster linting)
  ...etc

## To-Do

- [x] Move frontend code to `apps/web`
- [x] Move backend code to `apps/api`
- [x] Refactor configs and finish Turborepo setup
- [x] Reactor Auth functions from NextJS in `apps/web` into NestJS in `apps/api`
- [x] Reactor Board / Project / Task / User functions from NextJS in `apps/web` into NestJS in `apps/api`
- [x] Update database init script for NestJS in `apps/api`
- [ ] Fix the issues between NextJS and NestJS API format
- [ ] Update unit tests for NextJS in `apps/web`
- [ ] Write unit tests for NestJS in `apps/api`
- [ ] Update e2e tests for NextJS in `apps/web`
- [ ] Update README.md in `apps/web`
- [ ] Update README.md in `apps/api`
- [ ] Update README.md in root
- [ ] Add github actions for CI/CD
- [ ] Add vercel for deployment
