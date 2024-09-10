import { defineConfig } from "vitest/config";

export default defineConfig(() => {
  return {
    test: {
      coverage: {
        enabled: true,
      },
    },
  };
});
