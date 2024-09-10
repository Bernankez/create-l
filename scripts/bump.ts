import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolvePath } from "@bernankez/utils/node";
import { bumpPackages } from "../src/bump";
import { log } from "../src/utils/log";

function run(): void {
  const { __dirname } = resolvePath(import.meta.url);
  const templatesDir = resolve(__dirname, "../templates");
  const files = readdirSync(templatesDir);
  for (const file of files) {
    if (!file.startsWith("_") && !file.startsWith(".")) {
      log.info(`Fetching template ${file}...`);
      bumpPackages(resolve(templatesDir, file), false);
    }
  }
  const projectDir = resolve(__dirname, "..");
  log.info("Fetching project root...");
  bumpPackages(projectDir, false);
}

run();
