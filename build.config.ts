import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/cli",
  ],
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true,
      target: ["ES2022"],
    },
  },
});
