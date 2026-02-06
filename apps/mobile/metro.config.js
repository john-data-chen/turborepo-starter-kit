/* eslint-disable typescript-eslint/no-require-imports */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

const monorepoRoot = path.resolve(__dirname, "../..");
const config = getDefaultConfig(__dirname);

// Monorepo: watch all files in workspace
config.watchFolders = [monorepoRoot];

// Monorepo: resolve packages from both local and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules")
];

module.exports = withNativewind(config);
