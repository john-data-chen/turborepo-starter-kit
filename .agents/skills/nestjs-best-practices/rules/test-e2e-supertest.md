---
title: Use Supertest for E2E Testing
impact: HIGH
impactDescription: Validates the full request/response cycle
tags: testing, e2e, supertest, integration, vitest
---

## Use Supertest for E2E Testing

End-to-end tests use Supertest to make real HTTP requests against your NestJS application. They test the full stack including middleware, guards, pipes, and interceptors. Use the Vitest runner with Supertest for API E2E tests, and Mongoose `Connection` for database cleanup.

**Incorrect (no proper E2E setup or teardown):**

```typescript
// Only unit test controllers
describe('UsersController', () => {
  it('should return users', async () => {
    const service = { findAll: vi.fn().mockResolvedValue([]) };
    const controller = new UsersController(service as any);

    const result = await controller.findAll();

    expect(result).toEqual([]);
    // Doesn't test: routes, guards, pipes, serialization
  });
});

// E2E tests without proper setup/teardown
describe('Users API', () => {
  it('should create user', async () => {
    const app = await NestFactory.create(AppModule);
    // No proper initialization
    // No cleanup after test
    // Hits real database
  });
});
```

**Correct (proper E2E setup with Supertest + Vitest):**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same config as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.name).toBe('John');
          expect(res.body.email).toBe('john@test.com');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'invalid-email' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/000000000000000000000000')
        .expect(404);
    });
  });
});

// Testing with authentication
describe('Protected Routes (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 without token', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
  });

  it('should return user profile with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('test@test.com');
      });
  });
});

// Database isolation for E2E tests (Mongoose)
describe('Orders API (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  beforeEach(async () => {
    // Clean collections between tests
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });
});
```

Reference: [NestJS E2E Testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
