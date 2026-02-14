---
title: Use Schema Versioning and Migration Scripts
impact: HIGH
impactDescription: Enables safe, repeatable database schema changes
tags: database, migrations, mongoose, schema
---

## Use Schema Versioning and Migration Scripts

Mongoose is schema-flexible, but production applications still need disciplined schema evolution. Use schema versioning, migration scripts, and careful handling of schema changes to ensure consistency across environments. Never rely on ad-hoc manual changes.

**Incorrect (unversioned schema changes):**

```typescript
// Modify schema without migration plan
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String }) // Added without migration
  newField: string; // Existing documents don't have this field!
  // No default value, no migration for existing data
}

// Manual ad-hoc updates in production
@Injectable()
export class DatabaseService {
  async addField(): Promise<void> {
    await this.connection.collection('users').updateMany({}, {
      $set: { age: 0 },
    });
    // No version control, no rollback, inconsistent across envs
  }
}
```

**Correct (versioned schemas with migration scripts):**

```typescript
// Use schema versioning with @nestjs/mongoose
@Schema({ timestamps: true, versionKey: '__v' })
export class User {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  // New field with default — safe for existing documents
  @Prop({ type: Number, default: null })
  age: number | null;

  // Schema version for tracking evolution
  @Prop({ type: Number, default: 2 })
  schemaVersion: number;
}

// Migration script pattern
// migrations/002-add-user-age.ts
import { Connection } from 'mongoose';

export const migrationName = '002-add-user-age';

export async function up(connection: Connection): Promise<void> {
  const collection = connection.collection('users');

  // Add field with default to handle existing documents
  await collection.updateMany(
    { age: { $exists: false } },
    { $set: { age: null, schemaVersion: 2 } },
  );

  // Add index for frequently queried columns
  await collection.createIndex({ age: 1 });
}

export async function down(connection: Connection): Promise<void> {
  const collection = connection.collection('users');

  await collection.dropIndex('age_1');
  await collection.updateMany({}, { $unset: { age: '', schemaVersion: '' } });
}

// Migration runner service
@Injectable()
export class MigrationService {
  constructor(@InjectConnection() private connection: Connection) {}

  async runMigrations(): Promise<void> {
    // Track applied migrations in a dedicated collection
    const migrationsColl = this.connection.collection('_migrations');

    const migrations = [
      await import('./migrations/001-initial'),
      await import('./migrations/002-add-user-age'),
    ];

    for (const migration of migrations) {
      const applied = await migrationsColl.findOne({
        name: migration.migrationName,
      });

      if (!applied) {
        await migration.up(this.connection);
        await migrationsColl.insertOne({
          name: migration.migrationName,
          appliedAt: new Date(),
        });
      }
    }
  }
}

// Safe field rename (two-step migration)
// migrations/003-rename-name-to-fullName.ts
export async function up(connection: Connection): Promise<void> {
  const collection = connection.collection('users');

  // Step 1: Copy data to new field
  await collection.updateMany(
    { fullName: { $exists: false } },
    [{ $set: { fullName: '$name' } }],
  );

  // Step 2: Remove old field (only after verifying app works)
  // This should be a separate migration deployed after step 1 is confirmed
}

export async function down(connection: Connection): Promise<void> {
  const collection = connection.collection('users');
  await collection.updateMany({}, [{ $set: { name: '$fullName' } }]);
  await collection.updateMany({}, { $unset: { fullName: '' } });
}

// Run migrations on app bootstrap
// app.module.ts
@Module({
  imports: [MongooseModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      uri: config.get('MONGODB_URI'),
    }),
  })],
})
export class AppModule implements OnModuleInit {
  constructor(private migrationService: MigrationService) {}

  async onModuleInit(): Promise<void> {
    await this.migrationService.runMigrations();
  }
}
```

Reference: [Mongoose Schema Versioning](https://mongoosejs.com/docs/guide.html#versionKey)
