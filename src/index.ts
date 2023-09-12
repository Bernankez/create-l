import { join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { copySync, emptyDirSync, ensureDirSync } from "fs-extra/esm";
import { usePrompt } from "./prompt";
import { getDirname, pkgFromUserAgent, replaceWords } from "./utils";
import { log } from "./log";

log.info("create-l. TypeScript Library Scaffold.", { prefix: "\n" });

const { projectName, packageName, overwrite, libType, buildTool } = await usePrompt();

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

// Copy files
copySync(templateDir, root);
replaceWords(root, /project-name/g, projectName);
replaceWords(root, /package-name/g, packageName);

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

log.success(`Done. Now run:\n\n${cd}${hint}`, { prefix: "\n" });
