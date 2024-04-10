import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readJsonSync, writeJsonSync } from "fs-extra/esm";
import type { PackageJson, Replacement } from "../types";

const GIT_BRANCH_NAME = "__gitBranchName__";
const PROJECT_NAME = "__projectName__";
const PACKAGE_NAME = "__packageName__";

export function replacePackageJson(dest: string, packageJson: PackageJson) {
  const content = readJsonSync(dest);
  const res = { ...content, ...packageJson };
  writeJsonSync(dest, res, { spaces: 2 });
}

export function replacePlaceholder(root: string, keys: Replacement) {
  const { projectName, packageName, gitBranchName } = keys;
  replaceWords(root, new RegExp(PROJECT_NAME, "g"), projectName);
  replaceWords(root, new RegExp(PACKAGE_NAME, "g"), packageName);
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
