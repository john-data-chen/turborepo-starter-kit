---
title: Optimize Database Queries
impact: HIGH
impactDescription: Database queries are typically the largest source of latency
tags: performance, database, queries, optimization, mongoose
---

## Optimize Database Queries

Select only needed fields, use proper indexes, avoid over-fetching with `.populate()`, and use `.lean()` for read-only queries. Most API slowness traces back to inefficient database queries.

**Incorrect (over-fetching data and missing indexes):**

```typescript
// Select everything when you need few fields
@Injectable()
export class UsersService {
  async findAllEmails(): Promise<string[]> {
    const users = await this.userModel.find().exec();
    // Fetches ALL fields for ALL users, hydrates full Mongoose documents
    return users.map((u) => u.email);
  }

  async getUserSummary(id: string): Promise<UserSummary> {
    const user = await this.userModel
      .findById(id)
      .populate('posts')
      .populate({ path: 'posts', populate: { path: 'comments', populate: 'author' } })
      .populate('followers')
      .exec();
    // Over-fetches massive relation tree
    return { name: user.name, postCount: user.posts.length };
  }
}

// No indexes on frequently queried fields
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String })
  userId: string; // No index - full collection scan on every lookup

  @Prop({ type: String })
  status: string; // No index - slow status filtering
}
```

**Correct (select only needed data with proper indexes):**

```typescript
// Use .select() to fetch only needed fields
@Injectable()
export class UsersService {
  async findAllEmails(): Promise<string[]> {
    const users = await this.userModel
      .find()
      .select('email') // Only fetch email field
      .lean() // Return plain objects, skip Mongoose hydration
      .exec();
    return users.map((u) => u.email);
  }

  // Use aggregation for complex computed results
  async getUserSummary(id: string): Promise<UserSummary> {
    const [result] = await this.userModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },
      {
        $project: {
          name: 1,
          postCount: { $size: '$posts' },
        },
      },
    ]);
    return result;
  }

  // Fetch relations only when needed, with field selection
  async getFullProfile(id: string): Promise<User> {
    return this.userModel
      .findById(id)
      .select('name email')
      .populate({
        path: 'posts',
        select: 'title createdAt',
      })
      .lean()
      .exec();
  }
}

// Add indexes on frequently queried fields via schema decorators
@Schema({
  timestamps: true,
  // Compound indexes for common query patterns
  indexes: [
    { userId: 1, status: 1 },
    { createdAt: -1 },
  ],
})
export class Order {
  @Prop({ type: String, index: true }) // Single-field index
  userId: string;

  @Prop({ type: String, index: true })
  status: string;
}

// Always paginate large datasets
@Injectable()
export class OrdersService {
  async findAll(page = 1, limit = 20): Promise<PaginatedResult<Order>> {
    const [items, total] = await Promise.all([
      this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.orderModel.countDocuments(),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

Reference: [Mongoose Queries](https://mongoosejs.com/docs/queries.html)
