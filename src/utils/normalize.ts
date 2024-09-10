import { basename, resolve } from "node:path";
import { kebabCase } from "scule";
import type { BundleTool } from "../types";

export function getProjectName(projectName: string): string {
  return projectName === "." ? basename(resolve()) : projectName;
}

export function toValidProjectName(projectName: string): string {
  return projectName.replace(/\s+/g, "_");
}

export function isValidPackageName(name: string): boolean {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    name,
  );
}

export function toValidPackageName(projectName: string): string {
  return kebabCase(projectName.trim())
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

export function isValidBundleTool(bundleTool: string): bundleTool is BundleTool {
  return ["unbuild", "tsup", "vite"].includes(bundleTool);
}
