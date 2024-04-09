/* eslint-disable unused-imports/no-unused-vars */
import { resolve } from "node:path";
import process from "node:process";
import { resolvePath } from "@bernankez/utils/node";
import { loadArgs } from "./load";

async function run() {
  const args = await loadArgs();
  const { bundleTool, replacement } = args;
  const { projectName } = replacement;
  const { __dirname } = resolvePath(import.meta.url);
  const assetsDir = resolve(__dirname, "../templates/_common");
  const templateDir = resolve(__dirname, "../templates", bundleTool);
  const targetDir = resolve(process.cwd(), projectName);
  // copy template
  // copy assets (don't overwrite)
  // replace placeholder and packageJson
  console.log(args);
}

run();
