import { existsSync } from "node:fs";
import { cancel, confirm, intro, select, text } from "@bernankez/prompt";
import { getProjectName, isEmpty, isValidPackageName, toValidPackageName } from "./utils";

intro("create-l. Starter Kit to create library.");
// Project name
const defaultDir = "my-lib";
const projectName = await text({
  message: "Project name",
  placeholder: defaultDir,
  format: (value) => {
    return value || defaultDir;
  },
});
// Empty check
let overwrite = false;
if (existsSync(projectName) && !isEmpty(projectName)) {
  overwrite = await confirm({
    message: `${projectName === "." ? "Current directory" : `Target directory ${projectName}`} is not empty. Remove existing files and continue?`,
  });
  if (!overwrite) {
    cancel("Operation canceled");
    process.exit(0);
  }
}
// Package name
let packageName: string;
const defaultPackageName = toValidPackageName(getProjectName(projectName));
if (isValidPackageName(getProjectName(projectName))) {
  packageName = defaultPackageName;
} else {
  packageName = await text({
    message: "Package name",
    placeholder: defaultPackageName,
    validate(value) {
      if (value && !isValidPackageName(value)) {
        return "Invalid package.json name";
      }
    },
    format: (value) => {
      return value || defaultPackageName;
    },
  });
}
const libType = await select({
  message: "What kind of library do you want to build?",
  options: [
    { label: "NodeJS library", value: "library" },
    { label: "NodeJS library (monorepo)", value: "monorepo" },
    { label: "Vue SFC", value: "sfc" },
    { label: "Chrome extension", value: "chrome-extension", hint: "unavailable" },
    { label: "VSCode extension", value: "vscode-extension", hint: "unavailable" },
  ],
});
const buildTool = await select({
  message: "Select a build tool",
  options: [
    { label: "unbuild", value: "unbuild", hint: "Recommended" },
    { label: "tsup", value: "tsup" },
    { label: "vite", value: "vite" },
  ],
});
const language = await select({
  message: "Select a language",
  options: [
    { label: "TypeScript", value: "typescript" },
    { label: "JavaScript", value: "javascript" },
  ],
});
const installDependencies = await confirm({
  message: "Install dependencies?",
});
console.log(projectName, overwrite, packageName, libType, buildTool, language);
