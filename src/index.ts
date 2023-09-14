import { join, relative } from "node:path";
import { cwd } from "node:process";
import { emptyDirSync, ensureDirSync } from "fs-extra/esm";
import { pascalCase } from "scule";
import { usePrompt } from "./prompt";
import { log } from "./utils/log";
import { dumpPackages, packageFromUserAgent } from "./packages";
import { replacePlaceholder } from "./placeholder";
import { chooseTemplate, copyTemplate } from "./template";

log.info("create-l. TypeScript Library Scaffold.", { prefix: "\n" });

const { projectName, packageName, overwrite, libType, buildTool, packageJson } = await usePrompt();

const root = join(cwd(), projectName);
// Ensure dir
if (overwrite) {
  emptyDirSync(root);
}
ensureDirSync(root);

const templateDir = chooseTemplate(libType, buildTool);

copyTemplate(templateDir, root, {
  renameFiles: {
    _gitignore: ".gitignore",
  },
});

// replace placeholder
replacePlaceholder(root, {
  projectName,
  packageName,
  libraryName: pascalCase(packageName),
  packageJson,
});

// Get package info
const pkgManager = packageFromUserAgent(process.env.npm_config_user_agent)?.name || "npm";

// dump packages
log.info("fetching the latest package information...");
await dumpPackages(root, libType === "monorepo");

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
