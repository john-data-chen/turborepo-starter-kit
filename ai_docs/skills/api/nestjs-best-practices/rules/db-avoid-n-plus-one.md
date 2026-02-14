---
title: Avoid N+1 Query Problems
impact: HIGH
impactDescription: N+1 queries are one of the most common performance killers
tags: database, n-plus-one, queries, performance, mongoose
---

## Avoid N+1 Query Problems

N+1 queries occur when you fetch a list of documents, then make an additional query for each document to load related data. Use Mongoose `.populate()` for simple relations, aggregation pipelines with `$lookup` for complex joins, and DataLoader for GraphQL batching.

**Incorrect (lazy loading in loops causes N+1):**

```typescript
// Lazy loading in loops causes N+1
@Injectable()
export class OrdersService {
  async getOrdersWithItems(userId: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ userId }).exec();
    // 1 query for orders

    for (const order of orders) {
      // N additional queries - one per order!
      order.items = await this.orderItemModel.find({ orderId: order._id }).exec();
    }

    return orders;
  }
}

// Accessing unpopulated references
@Controller('users')
export class UsersController {
  @Get()
  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    // user.posts contains only ObjectId references, not actual data
    // Accessing each one triggers a separate query
    return users;
  }
}
```

**Correct (use populate or aggregation $lookup):**

```typescript
// Use .populate() for simple relation loading
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async getOrdersWithItems(userId: string): Promise<Order[]> {
    // Single query with population (similar to SQL JOIN)
    return this.orderModel
      .find({ userId })
      .populate('items')
      .populate({ path: 'items', populate: { path: 'product' } })
      .exec();
  }
}

// Use aggregation pipeline with $lookup for complex joins
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUsersWithPostCounts(): Promise<UserWithPostCount[]> {
    return this.userModel.aggregate([
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
  }

  async getActiveUsersWithPosts(): Promise<User[]> {
    return this.userModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
          pipeline: [
            { $match: { status: 'published' } },
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'postId',
                as: 'comments',
              },
            },
          ],
        },
      },
    ]);
  }
}

// Use .select() to limit returned fields with populate
async getOrderSummaries(userId: string): Promise<OrderSummary[]> {
  return this.orderModel
    .find({ userId })
    .select('total status')
    .populate({
      path: 'items',
      select: 'quantity price',
    })
    .lean()
    .exec();
}

// Use DataLoader for GraphQL to batch and cache queries
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class PostsLoader {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  readonly batchPosts = new DataLoader<string, Post[]>(async (userIds) => {
    // Single query for all users' posts
    const posts = await this.postModel
      .find({ userId: { $in: userIds } })
      .lean()
      .exec();

    // Group by userId
    const postsMap = new Map<string, Post[]>();
    for (const post of posts) {
      const key = post.userId.toString();
      const userPosts = postsMap.get(key) || [];
      userPosts.push(post);
      postsMap.set(key, userPosts);
    }

    // Return in same order as input
    return userIds.map((id) => postsMap.get(id) || []);
  });
}

// In resolver
@ResolveField()
async posts(@Parent() user: User): Promise<Post[]> {
  // DataLoader batches multiple calls into single query
  return this.postsLoader.batchPosts.load(user._id.toString());
}

// Enable Mongoose debug logging in development to detect N+1
// main.ts or app.module.ts
import mongoose from 'mongoose';
mongoose.set('debug', process.env.NODE_ENV === 'development');
```

Reference: [Mongoose Populate](https://mongoosejs.com/docs/populate.html)
