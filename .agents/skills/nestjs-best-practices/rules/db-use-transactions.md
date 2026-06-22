---
title: Use Transactions for Multi-Step Operations
impact: HIGH
impactDescription: Ensures data consistency in multi-step operations
tags: database, transactions, mongoose, consistency
---

## Use Transactions for Multi-Step Operations

When multiple database operations must succeed or fail together, wrap them in a Mongoose transaction. This prevents partial updates that leave your data in an inconsistent state. Use Mongoose sessions with `startSession()` and `session.withTransaction()` for automatic retry and rollback.

**Incorrect (multiple saves without transaction):**

```typescript
// Multiple saves without transaction
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
  ) {}

  async createOrder(userId: string, items: OrderItemDto[]): Promise<Order> {
    // If any step fails, data is inconsistent
    const order = await this.orderModel.create({ userId, status: 'pending' });

    for (const item of items) {
      await this.orderItemModel.create({ orderId: order._id, ...item });
      await this.inventoryModel.updateOne(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } },
      );
    }

    await this.paymentService.charge(order._id);
    // If payment fails, order and inventory are already modified!

    return order;
  }
}
```

**Correct (use Mongoose sessions for automatic rollback):**

```typescript
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

// Use session.withTransaction() for automatic retry and rollback
@Injectable()
export class OrdersService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
  ) {}

  async createOrder(userId: string, items: OrderItemDto[]): Promise<Order> {
    const session = await this.connection.startSession();
    let order: Order;

    await session.withTransaction(async () => {
      // All operations use the same session
      [order] = await this.orderModel.create(
        [{ userId, status: 'pending' }],
        { session },
      );

      for (const item of items) {
        await this.orderItemModel.create(
          [{ orderId: order._id, ...item }],
          { session },
        );
        await this.inventoryModel.updateOne(
          { productId: item.productId },
          { $inc: { stock: -item.quantity } },
          { session },
        );
      }

      // If this throws, everything rolls back automatically
      await this.paymentService.charge(order._id.toString());
    });

    session.endSession();
    return order;
  }
}

// Manual transaction control for complex scenarios
@Injectable()
export class TransferService {
  constructor(@InjectConnection() private connection: Connection) {}

  async transfer(fromId: string, toId: string, amount: number): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Debit source account
      await this.accountModel.updateOne(
        { _id: fromId },
        { $inc: { balance: -amount } },
        { session },
      );

      // Verify sufficient funds
      const source = await this.accountModel.findById(fromId).session(session);
      if (source.balance < 0) {
        throw new BadRequestException('Insufficient funds');
      }

      // Credit destination account
      await this.accountModel.updateOne(
        { _id: toId },
        { $inc: { balance: amount } },
        { session },
      );

      // Log the transaction
      await this.transactionLogModel.create(
        [{ fromId, toId, amount, timestamp: new Date() }],
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

// Service method with session support
@Injectable()
export class UsersService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async createWithProfile(
    userData: CreateUserDto,
    profileData: CreateProfileDto,
  ): Promise<User> {
    const session = await this.connection.startSession();
    let user: User;

    await session.withTransaction(async () => {
      [user] = await this.userModel.create([userData], { session });
      await this.profileModel.create(
        [{ ...profileData, userId: user._id }],
        { session },
      );
    });

    session.endSession();
    return user;
  }
}
```

Reference: [Mongoose Transactions](https://mongoosejs.com/docs/transactions.html)
