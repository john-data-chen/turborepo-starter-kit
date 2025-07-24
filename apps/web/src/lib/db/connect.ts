'use server';

import {
  CONNECT_TIMEOUT_MS,
  SERVER_SELECTION_TIMEOUT_MS,
  SOCKET_TIMEOUT_MS
} from '@/constants/db';
import { connect, connection, ConnectOptions } from 'mongoose';

// This file is used in both server and client components
// We need to be careful about what we import/use here

let isConnected = false;
let dbUrl: string | undefined;

// MongoDB connection options
const getClientOptions = (): ConnectOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    autoIndex: !isProduction, // Only auto-create indexes in development
    connectTimeoutMS: CONNECT_TIMEOUT_MS,
    socketTimeoutMS: SOCKET_TIMEOUT_MS,
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    ...(isProduction || process.env.CI
      ? {
          serverApi: {
            version: '1' as const,
            strict: true,
            deprecationErrors: true
          }
        }
      : {})
  };
};

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  // Only try to access process.env in Node.js environment
  if (typeof process !== 'undefined') {
    // In Node.js environment, we can use environment variables
    dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      console.error(
        '\x1b[31mError: DATABASE_URL is not defined in environment variables\x1b[0m'
      );
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          'DATABASE_URL is required. Please check your .env file.'
        );
      }
    } else {
      console.log('\x1b[32mDatabase URL configured successfully\x1b[0m');
    }
  }

  try {
    console.log('Connecting to MongoDB...');

    const options = getClientOptions();
    await connect(dbUrl || '', options);

    // Only verify connection in production
    if (process.env.NODE_ENV === 'production') {
      if (connection.db) {
        await connection.db.admin().command({ ping: 1 });
      } else {
        throw new Error('Database connection not established');
      }
    }

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error: unknown) {
    isConnected = false;

    if (error instanceof Error) {
      // Provide more specific error messages based on error type
      if (error.name === 'MongoServerSelectionError') {
        console.error(
          'MongoDB connection failed: Database server not running or unreachable'
        );
        throw new Error(
          'Database server is not running or unreachable. Please verify MongoDB service is running properly.'
        );
      } else if (error.name === 'MongoNetworkError') {
        console.error(
          'MongoDB network error: Unable to connect to the database'
        );
        throw new Error(
          'Database network connection error. Please check network settings and database address.'
        );
      } else {
        console.error('MongoDB connection error:', error);
        throw error;
      }
    } else {
      console.error('Unknown MongoDB connection error:', error);
      throw new Error(
        'An unknown error occurred while connecting to the database'
      );
    }
  }
}
