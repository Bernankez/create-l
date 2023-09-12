import { existsSync } from "fs";
// eslint-disable-next-line import/no-named-default
import { default as Enquirer } from "enquirer";
import { getProjectName, isEmpty, isValidPackageName, toValidPackageName } from "./utils";
import { log } from "./log";

const { prompt } = Enquirer;

// @ts-expect-error no type def
prompt.on("cancel", () => {
  log.error("Operation cancelled");
  process.exit();
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
      process.exit(0);
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
  const { libType } = await prompt<{ libType: string }>({
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
  let buildTool: "unbuild" | "tsup" | "vite" | undefined;
  if (libType === "library") {
    buildTool = (await prompt<{ buildTool: "unbuild" | "tsup" | "vite" }>({
      type: "select",
      name: "buildTool",
      message: "Select a build tool",
      choices: ["unbuild", "tsup", "vite"],
    })).buildTool;
  }

  return {
    projectName,
    packageName,
    overwrite,
    libType,
    buildTool,
  };
}

