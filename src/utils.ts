import path from "node:path";
import fs from "fs-extra";

export function formatTargetDir(targetDir?: string) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

export function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

export function getProjectName(projectName: string) {
  return projectName === "." ? path.basename(path.resolve()) : projectName;
}

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}
