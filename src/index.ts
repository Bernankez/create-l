import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { cancel, confirm, intro, isCancel, log, onCancel, outro, select, text } from "@bernankez/prompt";
import { copySync, emptyDirSync, ensureDirSync } from "fs-extra/esm";
import { getDirname, getProjectName, isEmpty, isValidPackageName, pkgFromUserAgent, replaceWords, toValidPackageName } from "./utils";

onCancel((value) => {
  if (isCancel(value)) {
    cancel("Operation canceled");
    process.exit(0);
  }
});

intro("create-l. Simple scaffold to create library.");
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
// Library type
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
// Build tool
let buildTool: "unbuild" | "tsup" | "vite" | undefined;
if (libType === "library") {
  buildTool = await select({
    message: "Select a build tool",
    options: [
      { label: "unbuild", value: "unbuild", hint: "Recommended" },
      { label: "tsup", value: "tsup" },
      { label: "vite", value: "vite" },
    ],
  });
} else if (libType === "chrome-extension" || libType === "vscode-extension") {
  cancel("'chrome-extension' and 'vscode-extension' is not yet supported.");
  process.exit(0);
}

const root = join(cwd(), projectName);
// ensure dir
if (overwrite) {
  emptyDirSync(root);
}
ensureDirSync(root);
// decide template
let templateDir: string;
const __dirname = getDirname(import.meta.url);
if (libType === "library") {
  if (buildTool === "unbuild") {
    templateDir = resolve(__dirname, "../template/library/unbuild");
  } else if (buildTool === "tsup") {
    templateDir = resolve(__dirname, "../template/library/tsup");
  } else if (buildTool === "vite") {
    templateDir = resolve(__dirname, "../template/library/vite");
  }
} else if (libType === "sfc") {
  templateDir = resolve(__dirname, "../template/sfc");
} else if (libType === "monorepo") {
  templateDir = resolve(__dirname, "../template/monorepo");
}
// copy files
copySync(templateDir!, root);
replaceWords(root!, /package-name/g, packageName);
replaceWords(root!, /project-name/g, projectName);

const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
const pkgManager = pkgInfo ? pkgInfo.name : "npm";
const cdProjectName = relative(cwd(), root);
let cd = "";
if (root !== cwd()) {
  cd = `cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }\n`;
}
let hint = "";
switch (pkgManager) {
  case "yarn":
    hint = "yarn\n  yarn dev";
    break;
  default:
    hint = `${pkgManager} install\n${pkgManager} run dev`;
    break;
}
log.step(`Done. Now run:\n\n${cd}${hint}`);
outro("Complete!");
