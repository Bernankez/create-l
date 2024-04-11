import { describe, expect, it } from "vitest";
import micromatch from "micromatch";

const files = [
  "/user/js/1.js",
  "/user/templates/js/2.js",
  "/user/vue/a.vue",
  "/user/templates/vue/b.vue",
  "/user/css/a.css",
  "/user/templates/css/b.css",
];

describe("micromatch", () => {
  it("wildcards test", () => {
    expect(micromatch(["foo", "bar", "baz", "qux"], ["f*", "b*"])).toMatchInlineSnapshot(`
      [
        "foo",
        "bar",
        "baz",
      ]
    `);
  });

  it("should match js files", () => {
    expect(micromatch(files, "**/*.js")).toMatchInlineSnapshot(`
      [
        "/user/js/1.js",
        "/user/templates/js/2.js",
      ]
    `);
  });

  it("should not match vue files", () => {
    expect(micromatch(files, "**/*.!(vue)")).toMatchInlineSnapshot(`
      [
        "/user/js/1.js",
        "/user/templates/js/2.js",
        "/user/css/a.css",
        "/user/templates/css/b.css",
      ]
    `);
  });

  it("should not match css files by micromatch.not", () => {
    expect(micromatch.not(files, "**/*.css")).toMatchInlineSnapshot(`
      [
        "/user/js/1.js",
        "/user/templates/js/2.js",
        "/user/vue/a.vue",
        "/user/templates/vue/b.vue",
      ]
    `);
  });

  it("should match files under templates", () => {
    expect(micromatch(files, "**/templates/**")).toMatchInlineSnapshot(`
      [
        "/user/templates/js/2.js",
        "/user/templates/vue/b.vue",
        "/user/templates/css/b.css",
      ]
    `);
  });

  it("should not match files under templates", () => {
    expect(micromatch.not(files, "**/templates/**")).toMatchInlineSnapshot(`
      [
        "/user/js/1.js",
        "/user/vue/a.vue",
        "/user/css/a.css",
      ]
    `);
  });
});
