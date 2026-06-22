---
title: Use Testing Module for Unit Tests
impact: HIGH
impactDescription: Enables proper isolated testing with mocked dependencies
tags: testing, unit-tests, mocking, vitest
---

## Use Testing Module for Unit Tests

Use `@nestjs/testing` module to create isolated test environments with mocked dependencies. This ensures your tests run fast, don't depend on external services, and properly test your business logic in isolation. Use Vitest (`vi.fn`, `vi.spyOn`) and Mongoose `Model<T>` mocks with `getModelToken`.

**Incorrect (manual instantiation bypassing DI):**

```typescript
// Instantiate services manually without DI
describe('UsersService', () => {
  it('should create user', async () => {
    const model = new UserModel(); // Real model!
    const service = new UsersService(model);

    const user = await service.create({ name: 'Test' });
    // This hits the real database!
  });
});

// Test implementation details
describe('UsersController', () => {
  it('should call service', async () => {
    const service = { create: vi.fn() };
    const controller = new UsersController(service as any);

    await controller.create({ name: 'Test' });

    expect(service.create).toHaveBeenCalled(); // Tests implementation, not behavior
  });
});
```

**Correct (use Test.createTestingModule with Mongoose model mocks):**

```typescript
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { User } from '../src/modules/users/schemas/users.schema';

// Define a mock constructor for the Model (matches Mongoose Model behavior)
class MockUserModel {
  constructor(data: any) {
    return {
      ...data,
      save: vi.fn().mockResolvedValue(data),
    };
  }

  static find = vi.fn().mockReturnThis();
  static findOne = vi.fn().mockReturnThis();
  static findById = vi.fn().mockReturnThis();
  static findByIdAndUpdate = vi.fn().mockReturnThis();
  static deleteOne = vi.fn().mockReturnThis();
  static exec = vi.fn();
}

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof MockUserModel & Model<User>>(
      getModelToken(User.name),
    );
  });

  describe('create', () => {
    it('should save and return user', async () => {
      const dto = { name: 'John', email: 'john@test.com' };

      const result = await service.create(dto);

      expect(result.name).toBe(dto.name);
      expect(result.email).toBe(dto.email);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { _id: '1', name: 'John' };
      (userModel.findById as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(user),
      });

      const result = await service.findById('1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      (userModel.findById as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });
});

// Testing guards and interceptors
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow when no roles required', () => {
    const context = createMockExecutionContext({ user: { roles: [] } });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow admin for admin-only route', () => {
    const context = createMockExecutionContext({ user: { roles: ['admin'] } });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(true);
  });
});

function createMockExecutionContext(request: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => vi.fn(),
    getClass: () => vi.fn(),
  } as ExecutionContext;
}
```

Reference: [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
