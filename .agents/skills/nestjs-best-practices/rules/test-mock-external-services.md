---
title: Mock External Services in Tests
impact: HIGH
impactDescription: Ensures fast, reliable, deterministic tests
tags: testing, mocking, external-services, vitest
---

## Mock External Services in Tests

Never call real external services (APIs, databases, message queues) in unit tests. Mock them to ensure tests are fast, deterministic, and don't incur costs. Use Vitest mocking (`vi.fn`, `vi.spyOn`, `vi.useFakeTimers`) with realistic mock data. Use `getModelToken` to mock Mongoose models.

**Incorrect (calling real APIs and databases):**

```typescript
// Call real APIs in tests
describe('PaymentService', () => {
  it('should process payment', async () => {
    const service = new PaymentService(new StripeClient(realApiKey));
    // Hits real Stripe API!
    const result = await service.charge('tok_visa', 1000);
    // Slow, costs money, flaky
  });
});

// Use real database
describe('UsersService', () => {
  beforeEach(async () => {
    await connection.collection('users').deleteMany({}); // Modifies real DB
  });

  it('should create user', async () => {
    const user = await service.create({ email: 'test@test.com' });
    // Side effects on shared database
  });
});

// Incomplete mocks
const mockHttpService = {
  get: vi.fn().mockResolvedValue({ data: {} }),
  // Missing error scenarios, missing other methods
};
```

**Correct (mock all external dependencies):**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

// Mock HTTP service properly
describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: vi.fn(),
            post: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WeatherService);
    httpService = module.get(HttpService);
  });

  it('should return weather data', async () => {
    const mockResponse = {
      data: { temperature: 72, humidity: 45 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    vi.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const result = await service.getWeather('NYC');

    expect(result).toEqual({ temperature: 72, humidity: 45 });
  });

  it('should handle API timeout', async () => {
    vi.spyOn(httpService, 'get').mockReturnValue(
      throwError(() => new Error('ETIMEDOUT')),
    );

    await expect(service.getWeather('NYC')).rejects.toThrow('Weather service unavailable');
  });

  it('should handle rate limiting', async () => {
    vi.spyOn(httpService, 'get').mockReturnValue(
      throwError(() => ({
        response: { status: 429, data: { message: 'Rate limited' } },
      })),
    );

    await expect(service.getWeather('NYC')).rejects.toThrow(TooManyRequestsException);
  });
});

// Mock Mongoose Model instead of database
describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  // Define mock model class (matches Mongoose Model behavior)
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
    static deleteOne = vi.fn().mockReturnThis();
    static exec = vi.fn();
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
      ],
    }).compile();

    service = module.get(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should find user by id', async () => {
    const mockUser = { _id: '1', name: 'John', email: 'john@test.com' };
    (userModel.findById as any).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUser),
    });

    const result = await service.findById('1');

    expect(result).toEqual(mockUser);
    expect(userModel.findById).toHaveBeenCalledWith('1');
  });
});

// Create mock factory for complex SDKs
function createMockStripe() {
  return {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
      confirm: vi.fn(),
      cancel: vi.fn(),
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  };
}

// Mock time for time-dependent tests
describe('TokenService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should expire token after 1 hour', async () => {
    const token = await service.createToken();

    // Fast-forward time
    vi.advanceTimersByTime(61 * 60 * 1000);

    expect(await service.isValid(token)).toBe(false);
  });
});
```

Reference: [Vitest Mocking](https://vitest.dev/guide/mocking)
