import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolvePath } from "@bernankez/utils/node";
import { removeSync } from "fs-extra/esm";

export function clean(): void {
  const { __dirname } = resolvePath(import.meta.url);
  const removeDir = ["node_modules", "dist", "coverage", "bun.lockb", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
  const templateDir = ["unbuild", "tsup", "vite"].map(tool => resolve(__dirname, "../templates", tool));
  for (const dir of templateDir) {
    const files = readdirSync(dir);
    for (const file of files) {
      if (removeDir.includes(file)) {
        removeSync(resolve(dir, file));
      }
    }
  }
}

clean();
