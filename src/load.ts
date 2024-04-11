import process from "node:process";
import { existsSync } from "node:fs";
import { cac } from "cac";
import { version } from "../package.json";
import { getProjectName, isValidBundleTool, isValidPackageName, toValidPackageName, toValidProjectName } from "./utils/normalize";
import { isEmpty } from "./utils/io";
import { log } from "./utils/log";
import { loadPrompts } from "./prompt";
import type { BundleTool, TemplateFields } from ".";

export async function loadArgs(argv = process.argv): Promise<TemplateFields> {
  const cli = cac("create-l");
  cli
    .version(version)
    .usage("[options]")
    .option("-n, --name <name>", "Project name")
    .option("-b, --bundle <unbuild | tsup | vite>", "Bundle tool")
    .help();
  const result = cli.parse(argv);
  const options = result.options;
  if (!options.help && !options.version) {
    if (Object.keys(options).length > 1) {
      let origin: string;
      if (options.name && typeof options.name === "string") {
        origin = options.name;
      } else {
        origin = "my-lib";
      }
      let bundleTool: BundleTool;
      if (options.bundle && typeof options.bundle === "string" && isValidBundleTool(options.bundle)) {
        bundleTool = options.bundle;
      } else {
        bundleTool = "unbuild";
      }
      if (existsSync(origin) && !isEmpty(origin)) {
        log.error("Directory not empty, operation cancelled.");
        process.exit(0);
      }
      const projectName = toValidProjectName(getProjectName(origin));
      const packageName = isValidPackageName(projectName) ? projectName : toValidPackageName(projectName);
      return {
        overwrite: true,
        bundleTool,
        replacement: {
          projectName,
          packageName,
        },
      };
    } else {
      return loadPrompts();
    }
  }
  process.exit(0);
}
