import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import basicSsl from "@vitejs/plugin-basic-ssl";
import UnoCSS from "unocss/vite";
import Playground from "./plugins/playground";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS(), basicSsl(), Playground()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "~": resolve(__dirname),
    },
  },
  server: {
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
