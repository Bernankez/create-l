/// <reference types="vitest" />

import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    test: {
      coverage: {
        enabled: true,
      },
    },
  };
});
