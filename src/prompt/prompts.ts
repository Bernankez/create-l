import { existsSync } from "node:fs";
import process from "node:process";
// waiting for release https://github.com/enquirer/enquirer/pull/427
// eslint-disable-next-line import/no-named-default
import { default as Enquirer } from "enquirer";
import type { RequiredSome } from "@bernankez/utils";
import { fillPackageJsonTemplate, generatePackageJsonTemplate, type PackageJsonOptions, type PromptField } from "../template";
import { isEmpty } from "../utils/io";
import { log } from "../utils/log";
import { getProjectName, isValidPackageName, toValidPackageName, toValidProjectName } from "../utils/normalize";
import type { AdditionalTool, BundleTool, PackageJson } from "../types";

const { prompt } = Enquirer;

// @ts-expect-error no type def
prompt.on("cancel", () => {
  log.error("Operation canceled.\n");
  process.exit(0);
});

export async function askProjectName(): Promise<{ projectName: string; origin: string }> {
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

export async function askOverwrite(origin: string): Promise<{ overwrite: boolean; empty: boolean }> {
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

export async function askPackageName(projectName?: string): Promise<string> {
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

export async function askBundleTool(): Promise<BundleTool> {
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

export async function askAdditionalTools(): Promise<AdditionalTool[]> {
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

export async function askGitBranchName(): Promise<string> {
  const { gitBranchName } = await prompt<{ gitBranchName: string }>({
    type: "input",
    message: "Git main branch name",
    name: "gitBranchName",
    initial: "master",
  });
  return gitBranchName;
}

export async function askCustomizePackageJson(options: PackageJsonOptions): Promise<{ packageJson: RequiredSome<Record<PromptField["name"], string>, "projectName" | "packageName" | "version">; template: PackageJson } | undefined> {
  const { customize } = await prompt<{ customize: boolean }>({
    type: "confirm",
    message: "Customize package.json?",
    name: "customize",
    initial: true,
  });
  if (customize) {
    return await askPackageJson(options);
  }
  return undefined;
}

export async function askPackageJson(options: PackageJsonOptions): Promise<{ packageJson: RequiredSome<Record<PromptField["name"], string>, "projectName" | "packageName" | "version">; template: PackageJson }> {
  const { template, fields } = generatePackageJsonTemplate(options);
  const packageJson = (await prompt<{
    packageJson: {
      values: RequiredSome<Record<PromptField["name"], string>, "projectName" | "packageName" | "version"> ;
      result: string;
    };
  }>({
    type: "snippet",
    message: "Fill out the fields in package.json",
    name: "packageJson",
    template: JSON.stringify(template, null, 2),
    // @ts-expect-error no type def
    fields,
  })).packageJson.values;
  return {
    packageJson,
    /** Filled package json template */
    template: fillPackageJsonTemplate({ ...options, ...packageJson }),
  };
}

export async function askFetchingLatestPackages(): Promise<boolean> {
  const { fetchLatest } = await prompt<{ fetchLatest: boolean }>({
    type: "confirm",
    message: "Fetch latest packages?",
    name: "fetchLatest",
    initial: true,
  });
  return fetchLatest;
}
