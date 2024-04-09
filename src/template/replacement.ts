import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Replacement } from "../types";

const GIT_BRANCH_NAME = "__gitBranchName__";

export function replacePlaceholder(root: string, keys: Replacement) {
  const { gitBranchName } = keys;
  if (gitBranchName) {
    replaceWords(root, new RegExp(GIT_BRANCH_NAME, "g"), gitBranchName);
  }
}

export function replaceWords(dir: string, origin: RegExp | string, target: string) {
  if (!existsSync(dir)) {
    return;
  }
  const dirInfo = statSync(dir);
  if (dirInfo.isDirectory()) {
    const list = readdirSync(dir, { withFileTypes: true });
    list.forEach((info) => {
      if (info.isFile()) {
        const file = readFileSync(resolve(dir, info.name), "utf-8");
        const replaced = file.replace(origin, target);
        writeFileSync(resolve(dir, info.name), replaced, "utf-8");
      } else if (info.isDirectory()) {
        if (info.name === ".git") {
          return;
        }
        replaceWords(resolve(dir, info.name), origin, target);
      }
    });
  } else if (dirInfo.isFile()) {
    const file = readFileSync(dir, "utf-8");
    const replaced = file.replace(origin, target);
    writeFileSync(resolve(dir), replaced, "utf-8");
  }
}
