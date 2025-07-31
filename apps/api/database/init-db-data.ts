// This script should only run in Node.js environment
if (typeof process === 'undefined') {
  throw new Error('This script must be run in a Node.js environment');
}

// Load environment variables
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Board, BoardSchema } from '@/modules/boards/schemas/boards.schema';
import { Project, ProjectSchema } from '@/modules/projects/schemas/projects.schema';
import { Task, TaskSchema } from '@/modules/tasks/schemas/tasks.schema';
import { User, UserSchema } from '@/modules/users/schemas/users.schema';
import { demoProjects, demoTasks, demoUsers, demoBoards } from '@/constants/demoData';
import readline from 'readline';

dotenv.config();

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31mError: DATABASE_URL is required in .env file\x1b[0m');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL ? '***' + process.env.DATABASE_URL.split('@').pop() : 'Not set',
});

// Create a temporary module to bootstrap our application
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL || ''),
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
class AppModule {}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function confirmDatabaseReset(): Promise<boolean> {
  if (process.argv.includes('--force')) {
    return true;
  }

  return new Promise((resolve) => {
    rl.question(
      '\x1b[33mWarning: This will initialize the database with demo data.\nMake sure your MongoDB is running and .env is configured correctly.\nContinue? (y/N) \x1b[0m',
      (answer) => {
        resolve(answer.toLowerCase() === 'y');
        rl.close();
      }
    );
  });
}

async function main() {
  let app;
  try {
    // Create NestJS application context
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    // Get the Mongoose connection using the correct token
    const connection = app.get(getConnectionToken());
    console.log('Connecting to database...');
    // Check if already connected
    if (connection.readyState === 1) {
      console.log('Database already connected');
    } else {
      // Set up a promise that resolves when connected or rejects on error/timeout
      await new Promise<void>((resolve, reject) => {
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout after 10 seconds'));
        }, 10000);

        const onConnected = () => {
          clearTimeout(timeout);
          connection.removeListener('error', onError);
          console.log('Database connected successfully');
          resolve();
        };

        const onError = (err: Error) => {
          clearTimeout(timeout);
          connection.removeListener('open', onConnected);
          reject(err);
        };

        connection.once('open', onConnected);
        connection.once('error', onError);
      });
    }

    // Get the models directly from the connection
    const boardModel = connection.model(Board.name, BoardSchema);
    const projectModel = connection.model(Project.name, ProjectSchema);
    const taskModel = connection.model(Task.name, TaskSchema);
    const userModel = connection.model(User.name, UserSchema);

    const shouldContinue = await confirmDatabaseReset();
    if (!shouldContinue) {
      console.log('\x1b[33mOperation cancelled\x1b[0m');
      process.exit(0);
    }
    console.log('\x1b[36mInitializing database...\x1b[0m');

    // Clear existing data
    console.log('\x1b[36mClearing existing data...\x1b[0m');
    await Promise.all([
      boardModel.deleteMany({}),
      projectModel.deleteMany({}),
      taskModel.deleteMany({}),
      userModel.deleteMany({}),
    ]);

    // Insert demo users with explicit _id
    console.log('\x1b[36mInserting demo users...\x1b[0m');
    // Create users with explicit _id
    const usersToInsert = demoUsers.map(user => ({
      _id: new Types.ObjectId(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const createdUsers = await userModel.insertMany(usersToInsert);
    if (!createdUsers || createdUsers.length === 0) {
      throw new Error('No users were created. Cannot proceed without users.');
    }
    // Mongoose documents store the actual data in _doc and add methods/properties
    const markDoc = createdUsers[2]._doc || createdUsers[2]; // Mark.S
    const johnDoc = createdUsers[0]._doc || createdUsers[0]; // John.Doe
    const janeDoc = createdUsers[1]._doc || createdUsers[1]; // Jane.Doe`
    // Get the _id from the document
    const markId = markDoc._id;
    const johnId = johnDoc._id;
    const janeId = janeDoc._id;
    // Ensure we have a valid user ID
    if (!markId) {
      throw new Error('First user does not have an _id field');
    }

    // Insert demo boards with default owner first (needed for project references)
    console.log('\x1b[36mInserting demo boards...\x1b[0m');
    const currentDate = new Date();
    const boardsWithOwner = demoBoards.map((board) => {
      const boardData = {
        title: board.title,
        description: board.description || '',
        owner: markId,
        members: [markId],
        projects: [], // Will be updated after projects are created
        createdAt: currentDate,
        updatedAt: currentDate,
      };
      return boardData;
    });
    boardsWithOwner[1].owner = johnId;
    boardsWithOwner[1].members = [johnId];
    boardsWithOwner[2].owner = janeId;
    boardsWithOwner[2].members = [janeId];
    boardsWithOwner[3].owner = johnId;
    boardsWithOwner[3].members = [johnId, markId, janeId];
    const createdBoards = await boardModel.insertMany(boardsWithOwner);
    const defaultBoardId = createdBoards[0]._id;

    // Insert demo projects with required fields
    console.log('\x1b[36mInserting demo projects...\x1b[0m');
    
    // Create projects with proper owner and member assignments
    const projectsWithDefaults = [
      {
        ...demoProjects[0],
        owner: markId,
        members: [markId],
        board: defaultBoardId,
      },
      {
        ...demoProjects[1],
        owner: johnId,
        members: [johnId],
        board: createdBoards[3]._id,
      },
      {
        ...demoProjects[2],
        owner: janeId,
        members: [janeId],
        board: createdBoards[3]._id,
      },
      {
        ...demoProjects[3],
        owner: johnId,
        members: [johnId, markId, janeId],
        board: createdBoards[3]._id,
      }
    ];
    const createdProjects = await projectModel.insertMany(projectsWithDefaults);
    const defaultProjectId = createdProjects[0]._id;

    // Update board with project references
    await boardModel.updateOne(
      { _id: defaultBoardId },
      {
        $addToSet: {
          projects: { $each: createdProjects.map(p => p._id) }
        }
      }
    );

    // Insert demo tasks with default user assignments
    console.log('\x1b[36mInserting demo tasks...\x1b[0m');
    const tasksWithDefaults = demoTasks.map(task => ({
      ...task,
      project: defaultProjectId, // Assign to first project
      board: defaultBoardId,     // Assign to first board
      assignee: markId,
      creator: markId,
      lastModifier: markId, // Add required lastModifier field
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    }));
    tasksWithDefaults[1].assignee = janeId;
    tasksWithDefaults[1].creator = janeId;
    tasksWithDefaults[1].lastModifier = janeId;
    tasksWithDefaults[1].dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    tasksWithDefaults[2].assignee = johnId;
    tasksWithDefaults[2].creator = johnId;
    tasksWithDefaults[2].lastModifier = johnId;
    tasksWithDefaults[2].dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await taskModel.insertMany(tasksWithDefaults);

    console.log('\x1b[32mDatabase initialized successfully!\x1b[0m');
    console.log('\x1b[33mYou can now log in with the following test accounts:\x1b[0m');
    createdUsers.forEach(user => {
      console.log({
        name: user.name,
        email: user.email
      });
    });
    // Close the app and exit
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    if (app) {
      await app.close();
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
