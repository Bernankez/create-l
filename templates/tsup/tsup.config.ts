import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/cli.ts',
    'src/index.ts',
  ],
  outExtension({ format }) {
    let js: string;
    switch (format) {
      case "cjs":
        js = ".cjs";
        break;
      case "esm":
        js = ".mjs";
        break;
      case "iife":
        js = ".global.js";
        break;
    }
    return {
      js,
    };
  },
  shims: true,
  inject: ['cjs-shims.ts'],
})
