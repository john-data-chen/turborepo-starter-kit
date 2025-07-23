// This script should only run in Node.js environment
if (typeof process === 'undefined') {
  throw new Error('This script must be run in a Node.js environment');
}

// Load environment variables
import dotenv from 'dotenv';
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

// Now import other dependencies
import {
  demoBoards,
  demoProjects,
  demoTasks,
  demoUsers
} from '@/constants/demoData';
import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';
import readline from 'readline';
import { BoardModel } from '../src/models/board.model';
import { ProjectModel } from '../src/models/project.model';
import { TaskModel } from '../src/models/task.model';
import { UserModel } from '../src/models/user.model';

console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  CI: process.env.CI,
  DATABASE_URL: !!process.env.DATABASE_URL
});

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
  try {
    console.log('\x1b[32mEnvironment variables verified successfully\x1b[0m');
    console.log('Connecting to database...');

    const shouldContinue = await confirmDatabaseReset();
    if (!shouldContinue) {
      console.log('\x1b[33mOperation cancelled\x1b[0m');
      process.exit(0);
    }
    console.log('\x1b[36mInitializing database...\x1b[0m');
    try {
      await connectToDatabase();
      console.log('\x1b[32mDatabase connected successfully\x1b[0m');
    } catch (error) {
      console.error(
        '\x1b[31mFailed to connect to database. Please check your MongoDB service and .env configuration\x1b[0m'
      );
      throw error;
    }

    // Clear all collections
    console.log('\x1b[36mClearing existing data...\x1b[0m');
    await Promise.all([
      UserModel.deleteMany({}),
      BoardModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      TaskModel.deleteMany({})
    ]);
    console.log('Database cleared');

    // Create users
    const users = await UserModel.insertMany(demoUsers);
    console.log('Created users successfully');

    // Create boards
    const boards = await BoardModel.insertMany([
      {
        ...demoBoards[0], // Mark's Kanban
        owner: users[2]._id, // Mark S
        members: [users[2]._id],
        projects: []
      },
      {
        ...demoBoards[1], // John's Kanban
        owner: users[0]._id, // John
        members: [users[0]._id],
        projects: []
      },
      {
        ...demoBoards[2], // Jane's Kanban
        owner: users[1]._id, // Jane
        members: [users[1]._id],
        projects: []
      },
      {
        ...demoBoards[3], // Dev Team Board
        owner: users[1]._id, // John
        members: [users[0]._id, users[1]._id, users[2]._id], // All developers
        projects: []
      }
    ]);
    console.log('Created boards successfully');

    // Create projects
    const projects = await ProjectModel.insertMany([
      {
        ...demoProjects[0], // Mark's todo list
        owner: users[2]._id, // Mark S
        members: [users[2]._id],
        board: boards[0]._id // In Mark's Kanban
      },
      {
        ...demoProjects[1], // Demo Project 2
        owner: users[0]._id, // John
        members: [users[0]._id, users[2]._id],
        board: boards[3]._id // In Dev Team Board
      },
      {
        ...demoProjects[2], // Demo Project 3
        owner: users[1]._id, // Jane
        members: [users[1]._id, users[2]._id],
        board: boards[3]._id // In Dev Team Board
      }
    ]);
    console.log('Created projects successfully');

    // Update boards with project references
    await Promise.all([
      BoardModel.findByIdAndUpdate(boards[0]._id, {
        $push: { projects: projects[0]._id }
      }),
      BoardModel.findByIdAndUpdate(boards[3]._id, {
        $push: { projects: { $each: [projects[1]._id, projects[2]._id] } }
      })
    ]);

    // Create tasks
    const tasks = await TaskModel.insertMany([
      {
        ...demoTasks[0],
        board: boards[0]._id,
        project: projects[0]._id,
        assignee: users[2]._id, // Mark S
        creator: users[2]._id,
        lastModifier: users[2]._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        ...demoTasks[1],
        board: boards[1]._id,
        project: projects[1]._id,
        assignee: users[2]._id, // Mark
        creator: users[1]._id, // Jane
        lastModifier: users[1]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        ...demoTasks[2],
        board: boards[2]._id,
        project: projects[2]._id,
        assignee: users[1]._id, // Jane
        creator: users[0]._id, // John
        lastModifier: users[1]._id, // Jane
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ]);
    console.log('Created tasks successfully');

    // Final data summary
    console.log('Final data:', {
      users: users.length,
      boards: boards.length,
      projects: projects.length,
      tasks: tasks.length
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    rl.close();
    process.exit(0);
  }
}

main();
