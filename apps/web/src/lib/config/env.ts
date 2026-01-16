// This file is used in both Node.js and Edge Runtime environments
// For Edge Runtime, we rely on environment variables being set by the platform

// Only load dotenv in Node.js environment
if (typeof process !== "undefined" && !process.env.VERCEL) {
  (async () => {
    try {
      // Use dynamic import for ESM compatibility
      const dotenv = await import("dotenv");
      const path = await import("path");

      // Load environment variables from .env file in the project root
      const envPath = path.resolve(process.cwd(), ".env");

      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.error("Error loading .env file:", result.error);
        if (process.env.NODE_ENV !== "production") {
          throw result.error;
        }
      }
    } catch (error) {
      console.warn("Failed to load .env file:", error);
    }
  })();
}

// Get environment variables with defaults
const nodeEnv = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL;

// Validate required environment variables in Node.js environment
if (typeof process !== "undefined" && !process.env.VERCEL) {
  if (!databaseUrl) {
    const error = new Error(
      nodeEnv === "production"
        ? "Production DATABASE_URL is not defined"
        : "Local development DATABASE_URL is not defined. Please create a .env file with DATABASE_URL."
    );
    console.error("Environment configuration error:", error);
    if (nodeEnv !== "production") {
      throw error;
    }
  }
}

export const config = {
  // Database configuration
  databaseUrl,

  // Environment information
  nodeEnv,
  isProduction: nodeEnv === "production",
  isDevelopment: nodeEnv === "development",
  isTest: nodeEnv === "test",

  // Application configuration
  appName: process.env.APP_NAME || "Next.js App",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",

  // Feature flags
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  debug: process.env.NEXT_PUBLIC_DEBUG === "true"
};
