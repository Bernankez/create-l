import type { Plugin } from "vite";

export default function Playground(): Plugin {
  const moduleName = "virtual:playground";

  const packageJson = {
    name: "create-l-playground",
    type: "module",
    dependencies: {
      "create-l": "latest",
    },
  };

  return {
    name: moduleName,
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
        return `export const packageJson = \`${JSON.stringify(packageJson)}\`;
`;
      }
    },
  };
}
