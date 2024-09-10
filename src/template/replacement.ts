import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Replacement } from "../types";

const GIT_BRANCH_NAME = "__gitBranchName__";
const PROJECT_NAME = "__projectName__";
const PACKAGE_NAME = "__packageName__";
const PACKAGE_MANAGER = "__packageManager__";
const PACKAGE_MANAGER_ACTION = "__packageManagerAction__";

export function replacePlaceholder(root: string, keys: Replacement): void {
  const { projectName, packageName, packageManager, gitBranchName } = keys;
  replaceWords(root, createReplaceFn(new RegExp(PROJECT_NAME, "g"), projectName));
  replaceWords(root, createReplaceFn(new RegExp(PACKAGE_NAME, "g"), packageName));
  if (gitBranchName) {
    replaceWords(root, createReplaceFn(new RegExp(GIT_BRANCH_NAME, "g"), gitBranchName));
  }
  if (packageManager) {
    replaceWords(root, createReplaceFn(new RegExp(PACKAGE_MANAGER, "g"), packageManager));
    let packageManagerAction = "";
    if (packageManager === "pnpm") {
      packageManagerAction = "pnpm/action-setup@v4";
    } else if (packageManager === "bun") {
      packageManagerAction = "oven-sh/setup-bun@v2";
    }
    if (packageManagerAction) {
      replaceWords(root, createReplaceFn(new RegExp(PACKAGE_MANAGER_ACTION, "g"), packageManagerAction));
    } else {
      // yarn or npm
      replaceWords(root, (file) => {
        let lines = file.split("\n");
        lines = lines.filter(line => !line.includes(PACKAGE_MANAGER) && !line.includes(PACKAGE_MANAGER_ACTION));
        return lines.join("\n");
      });
    }
  }
}

export type ReplaceFn = (file: string) => string;

export function replaceWords(dir: string, fn: ReplaceFn): void {
  if (!existsSync(dir)) {
    return;
  }
  const dirInfo = statSync(dir);
  if (dirInfo.isDirectory()) {
    const list = readdirSync(dir, { withFileTypes: true });
    list.forEach((info) => {
      if (info.isFile()) {
        const file = readFileSync(resolve(dir, info.name), "utf-8");
        const replaced = fn(file);
        writeFileSync(resolve(dir, info.name), replaced, "utf-8");
      } else if (info.isDirectory()) {
        if (info.name === ".git") {
          return;
        }
        replaceWords(resolve(dir, info.name), fn);
      }
    });
  } else if (dirInfo.isFile()) {
    const file = readFileSync(dir, "utf-8");
    const replaced = fn(file);
    writeFileSync(resolve(dir), replaced, "utf-8");
  }
}

export function createReplaceFn(origin: RegExp | string, target: string): ReplaceFn {
  return (file: string) => file.replace(origin, target);
}
