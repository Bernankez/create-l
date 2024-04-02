import { resolve } from "node:path";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

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

export function copy(src: string, dest: string) {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    copyFileSync(src, dest);
  }
}

export function copyDir(srcDir: string, destDir: string) {
  mkdirSync(destDir, { recursive: true });
  for (const file of readdirSync(srcDir)) {
    const srcFile = resolve(srcDir, file);
    const destFile = resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

export function formatTargetDir(targetDir?: string) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

export function isEmpty(path: string) {
  const files = readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}
