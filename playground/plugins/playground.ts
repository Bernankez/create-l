import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { build } from "tsup";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function Playground(): Plugin {
  const moduleName = "virtual:playground";
  const entry = resolve(__dirname, "../../src/playground.ts");
  const output = resolve(__dirname, "../scripts");
  const playgroundPath = resolve(__dirname, "../scripts/playground.js");

  const packageJson = {
    name: "create-l-playground",
    type: "module",
    dependencies: {
      cac: "^6.7.14",
      chalk: "^5.3.0",
      enquirer: "^2.4.1",
    },
  };

  return {
    name: moduleName,
    async buildStart() {
      await build({
        config: false,
        entry: [entry],
        outDir: output,
        format: "esm",
        target: "node18",
        splitting: false,
        clean: true,
        shims: true,
        treeshake: true,
        external: ["cac", "chalk", "enquirer"],
        inject: [resolve(__dirname, "./cjs-shims.ts")],
      });
    },
    resolveId(id) {
      if (id === moduleName) {
        return `\0${id}`;
      }
    },
    load(id) {
      if (!id.startsWith("\0")) {
        return;
      }
      id = id.slice(1);
      if (id === moduleName) {
        const code = readFileSync(playgroundPath, "utf-8");
        return `export const playground = ${JSON.stringify(code)};
export const packageJson = \`${JSON.stringify(packageJson)}\`;
`;
      }
    },
  };
}
