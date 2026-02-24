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

// Monorepo: pnpm creates isolated node_modules per package, causing Metro to
// bundle multiple copies of React (e.g. from @expo/metro-runtime/node_modules/react-dom
// and react-native-web/node_modules/react-dom). Even if same version, different file
// paths = different Metro modules = broken hooks. Force all to mobile's copy.
const singletonPkgs = ["react", "react-dom"];
const singletonPaths = Object.fromEntries(
  singletonPkgs.map((pkg) => [
    "/node_modules/" + pkg + "/",
    path.resolve(__dirname, "node_modules", pkg) + "/"
  ])
);

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

  // Redirect duplicate React packages to mobile's single copy
  if (resolution?.type === "sourceFile" && resolution.filePath) {
    for (const [needle, canonicalBase] of Object.entries(singletonPaths)) {
      const idx = resolution.filePath.lastIndexOf(needle);
      if (idx !== -1 && !resolution.filePath.startsWith(canonicalBase)) {
        const relPath = resolution.filePath.substring(idx + needle.length);
        return { type: "sourceFile", filePath: canonicalBase + relPath };
      }
    }
  }

  return resolution;
};

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false
});
