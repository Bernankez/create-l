import { relative, resolve } from "node:path";
import process, { cwd, env } from "node:process";
import { resolvePath } from "@bernankez/utils/node";
import chalk from "chalk";
import { emptyDirSync, ensureDirSync } from "fs-extra/esm";
import { bumpPackages, packageFromUserAgent } from "./bump";
import { loadArgs } from "./load";
import { fillPackageJson } from "./template";
import { replacePlaceholder } from "./template/replacement";
import { resolvePackage } from "./template/resolve";
import { sortPackageJson } from "./template/sort";
import { copyAssetSync } from "./utils/io";
import { log } from "./utils/log";

async function run(): Promise<void> {
  log.info(`${chalk.bgBlue(chalk.white(" create-l "))} TypeScript library scaffold`);
  // resolve args
  const args = await loadArgs();
  const { overwrite, bundleTool, replacement, packageJson, additionalTools, fetchLatest } = args;
  const { projectName } = replacement;
  const { __dirname } = resolvePath(import.meta.url);
  const assetsDir = resolve(__dirname, "../templates/_common");
  const templateDir = resolve(__dirname, "../templates", bundleTool);
  const targetDir = resolve(process.cwd(), projectName);
  log.info("Copying templates...");
  if (overwrite) {
    emptyDirSync(targetDir);
  }
  ensureDirSync(targetDir);
  const ignores = new Set([".github"]);
  if (additionalTools?.includes("githubAction")) {
    ignores.delete(".github");
  }
  // copy templates
  copyAssetSync(templateDir, targetDir, {
    overwrite: true,
    renameFiles: {
      _gitignore: ".gitignore",
    },
    ignoreFiles: [...ignores],
  });
  // copy common assets
  copyAssetSync(assetsDir, targetDir, {
    overwrite: false,
    renameFiles: {
      _gitignore: ".gitignore",
    },
    ignoreFiles: [...ignores],
  });
  // assign package json
  if (packageJson) {
    fillPackageJson(resolve(targetDir, "package.json"), packageJson);
  }
  // set package manager
  const pkgManager = packageFromUserAgent(env.npm_config_user_agent)?.name || "npm";
  const { name, version } = await resolvePackage(pkgManager);
  fillPackageJson(resolve(targetDir, "package.json"), {
    packageManager: `${name}@${version}`,
  });
  // replace placeholder
  replacePlaceholder(targetDir, {
    ...replacement,
    packageManager: name,
  });
  // fetch latest packages
  if (fetchLatest) {
    log.info("Fetching latest packages...");
    await bumpPackages(targetDir, false);
  }
  // sort package json
  sortPackageJson(resolve(targetDir, "package.json"));
  // log hint
  let cd = "";
  if (targetDir !== cwd()) {
    const cdProjectName = relative(cwd(), targetDir);
    cd = `  cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}\n`;
  }
  let hint = "";
  switch (pkgManager) {
    case "yarn":
      hint = "  yarn\n  yarn dev\n  yarn preview";
      break;
    default:
      hint = `  ${pkgManager} install\n  ${pkgManager} run dev\n  ${pkgManager} run preview`;
      break;
  }
  log.success(`Done. Now run:\n${cd}${hint}`, { prefix: "\n" });
}

run();
