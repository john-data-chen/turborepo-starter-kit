---
title: Use Repository Pattern for Data Access
impact: HIGH
impactDescription: Decouples business logic from database
tags: architecture, repository, data-access, mongoose
---

## Use Repository Pattern for Data Access

Create custom repository services to encapsulate complex queries and database logic. Inject Mongoose models via `@InjectModel` and wrap them in repository classes. This keeps services focused on business logic, makes testing easier with mock models, and centralizes query patterns.

**Incorrect (complex queries in services):**

```typescript
// Complex queries mixed with business logic
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findActiveWithOrders(minOrders: number): Promise<User[]> {
    // Complex aggregation mixed with business logic
    return this.userModel.aggregate([
      { $match: { isActive: true, deletedAt: null } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      { $match: { $expr: { $gte: [{ $size: '$orders' }, minOrders] } } },
      { $sort: { createdAt: -1 } },
    ]);
  }

  // Service becomes bloated with query logic
}
```

**Correct (custom repository with encapsulated queries):**

```typescript
// Custom repository wrapping the Mongoose Model
@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).lean().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async findActiveWithMinOrders(minOrders: number): Promise<User[]> {
    return this.userModel.aggregate([
      { $match: { isActive: true, deletedAt: null } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      { $match: { $expr: { $gte: [{ $size: '$orders' }, minOrders] } } },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async save(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async updateById(id: string, update: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec();
  }
}

// Clean service with business logic only
@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  async getActiveUsersWithOrders(): Promise<User[]> {
    return this.usersRepo.findActiveWithMinOrders(1);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    return this.usersRepo.save({
      email: dto.email,
      name: dto.name,
    });
  }
}
```

Reference: [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
