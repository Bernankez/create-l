import process from "node:process";
import type { TemplateFields } from "..";
import { log } from "../utils/log";
import { askAdditionalTools, askBundleTool, askCustomizePackageJson, askOverwrite, askPackageName, askProjectName } from "./prompts";

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

  const customizePackageJson = await askCustomizePackageJson({
    projectName,
    packageName,
  });
  return {
    repoType: "single",
    overwrite,
    bundleTool,
    additionalTools,
    packageJson: customizePackageJson?.template,
    replacement: {
      projectName,
      packageName,
      ...customizePackageJson?.packageJson,
    },
  };
}
