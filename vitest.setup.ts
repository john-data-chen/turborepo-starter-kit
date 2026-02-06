import "dotenv/config";

import { execSync } from "child_process";
import path from "path";

import dotenv from "dotenv";

// Determine the correct path to the .env.test file relative to the project root
// This handles cases where tests are run from root or specific package directories
const root = execSync("git rev-parse --show-toplevel").toString().trim();
const envPath = path.resolve(root, ".env.test");

// Load environment variables from .env.test specifically for tests
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env.test file:", result.error);
} else {
  // Suppress logs in CI to reduce noise, but keep for local debugging if needed
  if (!process.env.CI) {
    console.log(".env.test file loaded successfully.");
  }
}
