/// <reference types="vitest" />

import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    test: {
      exclude: ["template", "node_modules"],
    },
  };
});
