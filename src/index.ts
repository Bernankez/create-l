import { join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { writeFileSync } from "node:fs";
import { copySync, emptyDirSync, ensureDirSync } from "fs-extra/esm";
import { pascalCase } from "scule";
import { run } from "npm-check-updates";
import type { PackageFile } from "npm-check-updates/build/src/types/PackageFile";
import { usePrompt } from "./prompt";
import { getDirname, pkgFromUserAgent, replaceWords } from "./utils";
import { log } from "./log";

const PROJECT_NAME = "__project-name__";
const PACKAGE_NAME = "__package-name__";
const LIBRARY_NAME = "__LibraryName__";
const VERSION = "__version__";
const DESCRIPTION = "__description__";
const README_PLACEHOLDER = "__readme-placeholder__";
const AUTHOR_NAME = "__author-name__";
const AUTHOR_EMAIL = "__author-email__";
const GITHUB_USERNAME = "__github-username__";

log.info("create-l. TypeScript Library Scaffold.", { prefix: "\n" });

const { projectName, packageName, overwrite, libType, buildTool, packageJson } = await usePrompt();

const root = join(cwd(), projectName);
// Ensure dir
if (overwrite) {
  emptyDirSync(root);
}
ensureDirSync(root);

// Decide template
let templateDir: string;
const __dirname = getDirname(import.meta.url);
if (libType === "library" && buildTool) {
  templateDir = resolve(__dirname, `../template/library/${buildTool}`);
} else {
  templateDir = resolve(__dirname, `../template/${libType}`);
}

const libraryName = pascalCase(packageName);

// Copy files
copySync(templateDir, root);
replaceWords(root, new RegExp(PROJECT_NAME, "g"), projectName);
replaceWords(root, new RegExp(PACKAGE_NAME, "g"), packageName);
replaceWords(root, new RegExp(LIBRARY_NAME, "g"), libraryName);

if (packageJson) {
  replaceWords(root, new RegExp(VERSION, "g"), packageJson.version);
  replaceWords(root, new RegExp(DESCRIPTION, "g"), packageJson.description);
  replaceWords(root, new RegExp(AUTHOR_NAME, "g"), packageJson.authorName);
  replaceWords(root, new RegExp(AUTHOR_EMAIL, "g"), packageJson.authorEmail);
  replaceWords(root, new RegExp(GITHUB_USERNAME, "g"), packageJson.githubUsername);
  replaceWords(root, new RegExp(README_PLACEHOLDER, "g"), "");
} else {
  const readmeHint = `\n- [ ] Replacing all the following fields in the project.
- \`__description__\` - Package description
- \`__author-name__\` - Author name
- \`__author-email__\` - Author email
- \`__github-username__\` - GitHub username`;
  replaceWords(root, new RegExp(VERSION, "g"), "0.0.0");
  replaceWords(root, new RegExp(README_PLACEHOLDER, "g"), readmeHint);
}

// Get package info
const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
const pkgManager = pkgInfo ? pkgInfo.name : "npm";

// Get package files paths
const packageFiles = ["./package.json"];
if (libType === "monorepo") {
  packageFiles.push("./packages/tsup/package.json", "./packages/unbuild/package.json", "./packages/vite/package.json");
}

// Get latest package versions
const tasks: Promise<PackageFile>[] = [];
for (const packageFile of packageFiles) {
  tasks.push(run({
    packageFile: resolve(root, packageFile),
    cache: false,
    jsonAll: true,
    packageManager: pkgManager as "npm" | "yarn" | "pnpm" | "deno" | "bun" | "staticRegistry",
  }) as Promise<PackageFile>);
}

// Write packageJson files
log.info("fetching the latest package information...");

await Promise.all(tasks).then((pkgJsons) => {
  for (const [index, pkgJson] of pkgJsons.entries()) {
    writeFileSync(resolve(root, packageFiles[index]), JSON.stringify(pkgJson, null, 2), "utf-8");
  }
});

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

log.success(`Done. Now run:\n\n${cd}${hint}`, { prefix: "\n" });
