/* eslint-disable typescript-eslint/no-require-imports */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

const monorepoRoot = path.resolve(__dirname, "../..");
const config = getDefaultConfig(__dirname);

// Monorepo: watch all files in workspace
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Monorepo: resolve packages from both local and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules")
];

// Monorepo: pnpm with nodeLinker: hoisted puts all packages in root node_modules
const rootNodeModules = path.resolve(monorepoRoot, "node_modules");
const mobileNodeModules = path.resolve(__dirname, "node_modules");

// Mobile pins react/react-dom to a different version than the workspace catalog
// (matches react-native-renderer bundled in react-native). Canonical location is
// apps/mobile/node_modules so the bundle never picks up the hoisted root copy.
const singletonPkgs = {
  react: mobileNodeModules,
  "react-dom": mobileNodeModules,
  "react-native": rootNodeModules,
  "react-native-web": rootNodeModules
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Zustand 5 ESM uses import.meta.env which breaks Metro's classic script on web
  if (platform === "web" && /^zustand(\/|$)/.test(moduleName)) {
    const resolution = context.resolveRequest(context, moduleName, platform);
    if (resolution?.type === "sourceFile" && resolution.filePath?.includes("/esm/")) {
      return {
        type: "sourceFile",
        filePath: resolution.filePath.replace("/esm/", "/").replace(/\.mjs$/, ".js")
      };
    }
    return resolution;
  }

  const resolution = context.resolveRequest(context, moduleName, platform);

  // Redirect duplicate React packages to their canonical install
  if (resolution?.type === "sourceFile" && resolution.filePath) {
    for (const [pkg, baseDir] of Object.entries(singletonPkgs)) {
      const needle = "/node_modules/" + pkg + "/";
      const idx = resolution.filePath.lastIndexOf(needle);
      if (idx !== -1) {
        const canonicalBase = baseDir + "/" + pkg + "/";
        if (!resolution.filePath.startsWith(canonicalBase)) {
          const relPath = resolution.filePath.substring(idx + needle.length);
          return { type: "sourceFile", filePath: canonicalBase + relPath };
        }
      }
    }
  }

  return resolution;
};

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false
});
