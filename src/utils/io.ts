import { constants, copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

export function isEmpty(path: string) {
  const files = readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

export interface CopyAssetOptions {
  overwrite?: boolean;
  renameFiles?: Record<string, string>;
  ignoreFiles?: string[];
}

export function copyAssetSync(src: string, dest: string, options?: CopyAssetOptions) {
  const { overwrite = true, renameFiles = {}, ignoreFiles = [] } = options || {};
  for (const file of readdirSync(src)) {
    const srcFile = resolve(src, file);
    if (ignoreFiles.includes(file)) {
      continue;
    }
    const destFile = renameFiles[file] ? resolve(dest, renameFiles[file]) : resolve(dest, file);
    copySync(srcFile, destFile, overwrite);
  }
}

export function copySync(src: string, dest: string, overwrite = true) {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    copyDirSync(src, dest, overwrite);
  } else {
    copyFileSync(src, dest, overwrite ? 0 : constants.COPYFILE_EXCL);
  }
}

export function copyDirSync(src: string, dest: string, overwrite = true) {
  if (existsSync(dest) && !isEmpty(dest) && !overwrite) {
    return;
  }
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src)) {
    const srcFile = resolve(src, file);
    const destFile = resolve(dest, file);
    copySync(srcFile, destFile, overwrite);
  }
}
