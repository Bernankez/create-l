import process from "node:process";
import type { TemplateFields } from "..";
import { log } from "../utils/log";
import { askAdditionalTools, askBundleTool, askCustomizePackageJson, askOverwrite, askPackageName, askProjectName, askRepoType } from "./prompts";

export async function loadPrompts(): Promise<TemplateFields> {
  const { projectName, origin } = await askProjectName();
  const { overwrite, empty } = await askOverwrite(origin);
  if (!empty && !overwrite) {
    log.error("Directory not empty, operation cancelled.");
    process.exit(0);
  }
  const packageName = await askPackageName(projectName);
  const repoType = await askRepoType();
  if (repoType === "single") {
    const bundleTool = await askBundleTool();
    const additionalTools = await askAdditionalTools();
    // eslint-disable-next-line unused-imports/no-unused-vars
    const customizePackageJson = await askCustomizePackageJson();
    return {
      repoType: "single",
      overwrite,
      bundleTool,
      additionalTools,
      replacement: {
        projectName,
        packageName,
      },
    };
  } else if (repoType === "mono") {
    // TODO
  }

  return Promise.resolve({} as any);
}
