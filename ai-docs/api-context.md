# API Architecture Context

> Load this file when working on `apps/api`. Referenced by `nestjs-best-practices` skill.

## Project-Specific Conventions

- `Service → Repository → Model (Mongoose)` — services never inject `Model<T>` directly
- `UserService→UserRepository`, `BoardService→BoardRepository+EventEmitter2`, `ProjectsService→ProjectRepository+BoardService+EventEmitter2`, `TasksService→TaskRepository+ProjectsService`
- Cascade deletes via `@nestjs/event-emitter`: Board→Projects→Tasks (unidirectional, no `forwardRef`)
- `AllExceptionsFilter` as `APP_FILTER` — controllers never try-catch
- Tests: manual constructor + `vi.fn()` mocks, NOT `TestingModule`

## StorageAdapter (API side)

`@repo/store` → `createAuthStore(adapter)`. Web uses `localStorage` adapter (`apps/web/src/stores/auth.ts`).
