/* eslint-disable unused-imports/no-unused-vars */
import { relative, resolve } from "node:path";
import process, { cwd, env } from "node:process";
import { resolvePath } from "@bernankez/utils/node";
import chalk from "chalk";
import { loadArgs } from "./load";
import { log } from "./utils/log";
import { packageFromUserAgent } from "./bump";

async function playground() {
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
  await new Promise(resolve => setTimeout(resolve, 1500));
  const ignores = new Set([".github"]);
  if (additionalTools?.includes("githubAction")) {
    ignores.delete(".github");
  }
  // set package manager
  const pkgManager = packageFromUserAgent(env.npm_config_user_agent)?.name || "npm";
  // fetch latest packages
  if (fetchLatest) {
    log.info("Fetching latest packages...");
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
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
  log.success(`Done.`, { prefix: "\n" });
  log.info(`Now you can run \`${pkgManager} create l\` in your terminal for an instant live experience!`, { prefix: "\n" });
}

playground();
