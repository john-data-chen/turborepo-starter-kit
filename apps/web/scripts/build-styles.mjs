import fs from "node:fs/promises";
import path from "node:path";

import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

const appDir = path.resolve(import.meta.dirname, "..");
const workspaceRoot = path.resolve(appDir, "../..");
const inputPath = path.join(workspaceRoot, "packages/ui/src/styles/globals.css");
const outputPath = path.join(appDir, "src/app/generated-ui.css");

const input = await fs.readFile(inputPath, "utf8");
const result = await postcss([tailwindcss({})]).process(input, {
  from: inputPath,
  to: outputPath
});

await fs.writeFile(outputPath, result.css);
