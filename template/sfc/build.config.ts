import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    { builder: "mkdist", input: "./src/", pattern: ["**", "!test"] },
    { builder: "mkdist", input: "./src/", format: "cjs", ext: "js", pattern: ["**", "!test"] },
  ],
  declaration: true,
  clean: true,
});
