<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import "@xterm/xterm/css/xterm.css";
import HelloWorld from "./components/HelloWorld.vue";
import { useTerminal } from "./composables/useTerminal";
import { useWebContainer } from "./composables/useWebcontainer";

const terminalElRef = ref<HTMLDivElement>();
const terminal = useTerminal(terminalElRef, {
  convertEol: true,
  cursorStyle: "block",
  cursorBlink: true,
  cursorInactiveStyle: "none",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  theme: {
    background: "#2e3440",
  },
});

const { webContainer, status } = useWebContainer();

const files = {
  // 这是一个文件，package.json 是文件名
  "package.json": {
    file: {
      contents: `
        {
          "name": "vite-starter",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          "devDependencies": {
            "vite": "^4.0.4"
          }
        }`,
    },
  },
  // 这是一个目录，src 是目录名
  "src": {
    // 目录下会有 directory 的属性
    directory: {
      // 这是一个文件，叫 mian.js
      "main.js": {
        // 文件下有 file 的属性
        file: {
          contents: `
            console.log('Hello from WebContainers!')
          `,
        },
      },
    },
  },
};

const stop = watch(webContainer, async (webContainer) => {
  if (webContainer) {
    nextTick(() => stop());
    await webContainer.mount(files);
    const shellProcess = await webContainer.spawn("npm", ["install"], {
      terminal: {
        cols: terminal.value!.cols,
        rows: terminal.value!.rows,
      },
    });
    shellProcess.output.pipeTo(new WritableStream({
      write(data) {
        terminal.value?.write(data);
      },
    }));
  }
}, { immediate: true });
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <div>{{ status }}</div>
  <div ref="terminalElRef" class="h-15.5rem w-full bg-gray overflow-auto"></div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
