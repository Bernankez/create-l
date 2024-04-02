import { existsSync } from "node:fs";

import { exit } from "node:process";
// waiting for release https://github.com/enquirer/enquirer/pull/427
// eslint-disable-next-line import/no-named-default
import { default as Enquirer } from "enquirer";
import { getProjectName, isValidPackageName, toValidPackageName } from "./utils";
import { log } from "./utils/log";
import { isEmpty } from "./io";
import type { BundleTool, TemplateType } from "./types";

const { prompt } = Enquirer;

// @ts-expect-error no type def
prompt.on("cancel", () => {
  log.error("Operation cancelled");
  exit();
});

export async function usePrompt() {
// Project name
  const defaultDir = "my-lib";
  const { projectName } = await prompt<{ projectName: string }>({
    type: "input",
    message: "Project name",
    name: "projectName",
    initial: defaultDir,
  });

  // Empty check
  let overwrite = false;
  if (existsSync(projectName) && !isEmpty(projectName)) {
    overwrite = (await prompt<{ overwrite: boolean }>({
      message: `${projectName === "." ? "Current directory" : `Target directory ${projectName}`} is not empty. Remove existing files and continue?`,
      name: "overwrite",
      type: "confirm",
      initial: true,
    })).overwrite;
    if (!overwrite) {
      log.error("Operation cancelled");
      exit(0);
    }
  }

  // Package name
  let packageName: string;
  const pn = getProjectName(projectName);
  const defaultPackageName = toValidPackageName(pn);
  if (isValidPackageName(pn)) {
    packageName = defaultPackageName;
  } else {
    packageName = (await prompt<{ packageName: string }>({
      type: "input",
      message: "Package name",
      name: "packageName",
      initial: defaultPackageName,
      validate: (value) => {
        if (value && !isValidPackageName(value)) {
          return "Invalid package.json name";
        }
        return true;
      },
    })).packageName;
  }

  // Library type
  const { libType } = await prompt<{ libType: TemplateType }>({
    message: "What kind of library do you want to build?",
    name: "libType",
    type: "select",
    choices: [
      { message: "NodeJS library", name: "library" },
      { message: "NodeJS library (monorepo)", name: "monorepo" },
      { message: "Vue SFC", name: "sfc" },
    // { name: "Chrome extension", value: "chrome-extension" },
    // { name: "VSCode extension", value: "vscode-extension" },
    ],
  });

  // Build tool
  let bundleTool: BundleTool | undefined;
  if (libType === "library") {
    bundleTool = (await prompt<{ buildTool: BundleTool }>({
      type: "select",
      name: "buildTool",
      message: "Select a bundle tool",
      choices: ["unbuild", "tsup", "vite"],
    })).buildTool;
  }

  let packageJson: {
    version: string;
    description: string;
    authorName: string;
    authorEmail: string;
    githubUsername: string;
  } | undefined;
  const { customPackageJson } = await prompt<{ customPackageJson: boolean }>({
    message: "Customize package.json?",
    name: "customPackageJson",
    type: "confirm",
    initial: true,
  });
  if (customPackageJson) {
    packageJson = (await prompt<{
      packageJson: {
        values: {
          version: string;
          description: string;
          authorName: string;
          authorEmail: string;
          githubUsername: string;
        };
        result: string;
      };
    }>({
      type: "snippet",
      name: "packageJson",
      message: "Fill out the fields in package.json",
      required: true,
      // @ts-expect-error no type def
      fields: [
        {
          name: "description",
          message: "Description",
        },
        {
          name: "authorName",
          message: "Author name",
        },
        {
          name: "authorEmail",
          message: "Author email",
        },
        {
          name: "githubUsername",
          message: "Github username",
        },
      ],
      template: `{
  "name": "${packageName}",
  "version": "\${version}",
  "description": "\${description}",
  "author" : {
    "name": "\${authorName}",
    "email": "\${authorEmail}",
    "url": "https://github.com/\${githubUsername}"
  },
  "homepage": "https://github.com/\${githubUsername}/${projectName}#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/\${githubUsername}/${projectName}.git"
  },
  "bugs": "https://github.com/\${githubUsername}/${projectName}/issues",
}`,
    })).packageJson.values;
  }

  return {
    projectName,
    packageName,
    overwrite,
    libType,
    bundleTool,
    packageJson,
  };
}
