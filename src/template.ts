import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";
import { pathExistsSync } from "fs-extra/esm";
import { resolvePath } from "@bernankez/utils/node";
import { copy } from "./io";
import type { BundleTool, TemplateType } from "./types";

const { __dirname } = resolvePath(import.meta.url);
export const rootDir = resolve(__dirname, "..");

export function chooseTemplate(templateType: TemplateType, bundleTool?: BundleTool) {
  let templateDir: string;
  if (templateType === "library" && bundleTool) {
    templateDir = resolve(rootDir, `template/library/${bundleTool}`);
  } else {
    templateDir = resolve(rootDir, `template/${templateType}`);
  }
  if (!pathExistsSync(templateDir)) {
    throw new Error("Template not found");
  }
  return templateDir;
}

export interface CopyTemplateOptions {
  renameFiles?: Record<string, string>;
}

export function copyTemplate(templateDir: string, targetPath: string, options: CopyTemplateOptions) {
  const { renameFiles = {} } = options;
  const files = readdirSync(templateDir);
  for (const file of files) {
    const target = renameFiles[file] ? join(targetPath, renameFiles[file]) : join(targetPath, file);
    copy(join(templateDir, file), target);
  }
}
