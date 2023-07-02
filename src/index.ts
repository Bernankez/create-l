import fs from "fs-extra";
import { cancel } from "@clack/prompts";
import { confirm, multiselect, select, text } from "./prompts";
import { formatTargetDir, getProjectName, isEmpty, isValidPackageName, toValidPackageName } from "./utils";

// Project name
const defaultDir = "my-lib";
const projectName = await text([{
  message: "Project name",
  placeholder: defaultDir,
}], (value) => {
  const v = value || defaultDir;
  return formatTargetDir(v)!;
});
// Empty check
let overwrite = false;
if (fs.existsSync(projectName) && !isEmpty(projectName)) {
  overwrite = await confirm([{
    message: `${projectName === "." ? "Current directory" : `Target directory ${projectName}`} is not empty. Remove existing files and continue?`,
  }]);
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
  packageName = await text([{
    message: "Package name",
    placeholder: defaultPackageName,
    validate(value) {
      if (value && !isValidPackageName(value)) {
        return "Invalid package.json name";
      }
    },
  }], (v) => {
    return v || defaultPackageName;
  });
}
const libType = await select([{
  message: "Select a library type",
  options: [
    { label: "NodeJS library", value: "library" },
    { label: "Chrome extension", value: "chrome-extension", hint: "unavailable" },
    { label: "VSCode extension", value: "vscode-extension", hint: "unavailable" },
  ],
}]);
const buildTool = await select([{
  message: "Select a build tool",
  options: [
    { label: "unbuild", value: "unbuild", hint: "Recommended" },
    { label: "tsup", value: "tsup" },
    { label: "vite", value: "vite" },
  ],
}]);
const language = await select([{
  message: "Select a language",
  options: [
    { label: "TypeScript", value: "typescript" },
    { label: "JavaScript", value: "javascript" },
  ],
}]);
const additionalInfos = await multiselect([{
  message: "Select additional infos",
  required: false,
  options: [
    { label: "Author", value: "author" },
    { label: "License", value: "license" },
    { label: "Git info", value: "git" },
  ],
}]);
const installDependencies = await confirm([{
  message: "Install dependencies?",
}]);
console.log(projectName, overwrite, packageName, libType, buildTool, language);
// q:extra packages
// eslint
// eslint config package-name
// q:extra infos
// author-name
// git github gitlab custom
// git-url
