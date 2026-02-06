import "dotenv/config";

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";

// Determine the correct path to the .env.test file relative to the project root
// This handles cases where tests are run from root or specific package directories
const root = execSync("git rev-parse --show-toplevel").toString().trim();
const envPath = path.resolve(root, ".env.test");

// Only attempt to load .env.test if it actually exists.
// In this monorepo the per-app .env.test files live in apps/web and apps/api,
// not at the repo root, so a missing root file is expected—not an error.
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error("Error loading .env.test file:", result.error);
  } else if (!process.env.CI) {
    console.log(".env.test file loaded successfully.");
  }
}
