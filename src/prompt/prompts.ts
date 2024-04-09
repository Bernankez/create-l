import { existsSync } from "node:fs";
// waiting for release https://github.com/enquirer/enquirer/pull/427
// eslint-disable-next-line import/no-named-default
import { default as Enquirer } from "enquirer";
import type { RequiredSome } from "@bernankez/utils";
import { getProjectName, isValidPackageName, toValidPackageName, toValidProjectName } from "../utils/normalize";
import { isEmpty } from "../utils/io";
import type { AdditionalTool, BundleTool } from "../types";
import { type PackageJsonOptions, fillPackageJsonTemplate, generatePackageJsonTemplate } from "../template";

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
  const { bundleTool } = await prompt<{ bundleTool: string }>({
    type: "select",
    message: "Bundle tool",
    name: "bundleTool",
    choices: [
      { message: "unbuild", name: "unbuild" },
      { message: "tsup", name: "tsup" },
      { message: "vite", name: "vite" },
      { message: "Vue SFC", name: "Vue SFC" },
    ],
    required: true,
  });
  if (bundleTool === "Vue SFC") {
    return "sfc";
  }
  return bundleTool as BundleTool;
}

export async function askAdditionalTools() {
  const { tools } = await prompt<{ tools: string[] }>({
    type: "multiselect",
    message: "Additional tools",
    name: "tools",
    choices: [
      { message: "GitHub Action", name: "GitHub Action" },
      { message: "Node CLI", name: "Node CLI" },
    ],
  });
  return tools.map<AdditionalTool>((tool) => {
    switch (tool) {
      case "GitHub Action":
        return "githubAction";
      case "Node CLI":
        return "cli";
      default:
        return tool as AdditionalTool;
    }
  });
}

export async function askCustomizePackageJson(options: PackageJsonOptions) {
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

export async function askPackageJson(options: PackageJsonOptions) {
  const { template, fields } = generatePackageJsonTemplate(options);
  const packageJson = (await prompt<{
    packageJson: {
      values: RequiredSome<Record<typeof fields[number]["name"], string>, "projectName" | "packageName" | "version"> ;
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
    template: fillPackageJsonTemplate({ ...options, ...packageJson }),
  };
}
