import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";
import { copy, getDirname } from "./io";

export function chooseTemplate(libType: string, buildTool?: string) {
  let templateDir: string;
  const __dirname = getDirname(import.meta.url);
  if (libType === "library" && buildTool) {
    templateDir = resolve(__dirname, `../template/library/${buildTool}`);
  } else {
    templateDir = resolve(__dirname, `../template/${libType}`);
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
