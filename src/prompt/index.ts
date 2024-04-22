import process from "node:process";
import type { TemplateFields } from "..";
import { log } from "../utils/log";
import { askAdditionalTools, askBundleTool, askCustomizePackageJson, askFetchingLatestPackages, askGitBranchName, askOverwrite, askPackageName, askProjectName } from "./prompts";

export async function loadPrompts(): Promise<TemplateFields> {
  const { projectName, origin } = await askProjectName();
  const { overwrite, empty } = await askOverwrite(origin);
  if (!empty && !overwrite) {
    log.error("Directory not empty, operation cancelled.");
    process.exit(0);
  }
  const packageName = await askPackageName(projectName);
  const bundleTool = await askBundleTool();
  const additionalTools = await askAdditionalTools();
  let gitBranchName: string | undefined;
  if (additionalTools.includes("githubAction")) {
    gitBranchName = await askGitBranchName();
  }

  const customizePackageJson = await askCustomizePackageJson({
    projectName,
    packageName,
  });
  const fetchLatest = await askFetchingLatestPackages();
  return {
    overwrite,
    bundleTool,
    additionalTools,
    fetchLatest,
    packageJson: customizePackageJson?.template,
    replacement: {
      projectName,
      gitBranchName,
      ...customizePackageJson?.packageJson,
      /** Should use origin packageName instead of packageJson.packageName */
      packageName,
    },
  };
}
