import { existsSync } from "node:fs";
// waiting for release https://github.com/enquirer/enquirer/pull/427
// eslint-disable-next-line import/no-named-default
import { default as Enquirer } from "enquirer";
import { getProjectName, isValidPackageName, toValidPackageName, toValidProjectName } from "../utils/normalize";
import { isEmpty } from "../utils/io";
import type { AdditionalTool, BundleTool, PackageJson } from "../types";

const { prompt } = Enquirer;

export async function askProjectName() {
  const { projectName } = await prompt<{ projectName: string }>({
    type: "input",
    message: "Project name",
    name: "projectName",
    initial: "my-lib",
  });
  return {
    projectName: toValidProjectName(getProjectName(projectName)),
    origin: projectName,
  };
}

export async function askOverwrite(origin: string) {
  if (existsSync(origin) && !isEmpty(origin)) {
    const { overwrite } = await prompt<{ overwrite: boolean }>({
      message: `${origin === "." ? "Current directory" : `Target directory ${origin}`} is not empty. Remove existing files and continue?`,
      name: "overwrite",
      type: "confirm",
      initial: true,
    });
    return {
      overwrite,
      empty: false,
    };
  }
  return {
    overwrite: false,
    empty: true,
  };
}

export async function askRepoType() {
  const { repoType } = await prompt<{ repoType: "Single repo" | "Monorepo" }>({
    type: "select",
    message: "Single repo or monorepo?",
    name: "repoType",
    choices: [
      { message: "Single repo", name: "Single repo" },
      { message: "Monorepo", name: "Monorepo" },
    ],
    required: true,
  });
  return repoType === "Single repo" ? "single" : "mono";
}

export async function askPackageName(projectName?: string) {
  if (projectName && isValidPackageName(projectName)) {
    return projectName;
  }
  const { packageName } = await prompt<{ packageName: string }>({
    type: "input",
    message: "Package name",
    name: "packageName",
    initial: projectName && toValidPackageName(projectName),
    validate: (value) => {
      if (value && !isValidPackageName(value)) {
        return "Invalid package.json name";
      }
      return true;
    },
  });
  return packageName;
}

export async function askBundleTool() {
  const { bundleTool } = await prompt<{ bundleTool: BundleTool }>({
    type: "select",
    message: "Bundle tool",
    name: "bundleTool",
    choices: [
      { message: "unbuild", name: "unbuild" },
      { message: "tsup", name: "tsup" },
      { message: "vite", name: "vite" },
    ],
    required: true,
  });
  return bundleTool;
}

export async function askAdditionalTools() {
  const { tools } = await prompt<{ tools: string[] }>({
    type: "multiselect",
    message: "Additional tools",
    name: "tools",
    choices: [
      { message: "GitHub Action", name: "GitHub Action" },
    ],
  });
  return tools.map<AdditionalTool>((tool) => {
    switch (tool) {
      case "GitHub Action":
        return "githubAction";
      default:
        return tool as AdditionalTool;
    }
  });
}

export async function askCustomizePackageJson() {
  const { customize } = await prompt<{ customize: boolean }>({
    type: "confirm",
    message: "Customize package.json?",
    name: "customize",
    initial: false,
  });
  if (customize) {
    return await askPackageJson();
  }
  return undefined;
}

export async function askPackageJson(): Promise<PackageJson> {
  // TODO: implement
  return {} as any;
}
