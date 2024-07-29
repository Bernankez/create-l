<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import Simulator from "./components/Simulator.vue";
import { useTerminal } from "./composables/useTerminal";
import { useWebContainer } from "./composables/useWebcontainer";

const terminalElRef = ref<HTMLDivElement>();
const terminal = useTerminal(terminalElRef, {
  convertEol: true,
  cursorInactiveStyle: "outline",
  cursorBlink: true,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
});

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
          },
          "devDependencies": {
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

const { webContainer, status } = useWebContainer({
  async onBooted(webContainer) {
    await webContainer.mount(files);
  },
});

const stop = watch([webContainer, terminal], async ([webContainer, terminal]) => {
  async function init() {
    if (webContainer && terminal) {
      nextTick(() => stop());
      const shellProcess = await webContainer.spawn("pnpm", ["create", "l"], {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      });
      shellProcess.output.pipeTo(new WritableStream({
        write: (data) => {
          terminal.write(data);
        },
      }));
      const inputStream = shellProcess.input.getWriter();
      terminal.onData((data) => {
        inputStream.write(data);
      });
      useEventListener(window, "resize", () => {
        shellProcess.resize({
          cols: terminal.cols,
          rows: terminal.rows,
        });
      });
    }
  }
  init();
}, { immediate: true });
</script>

<template>
  <Simulator :window="false" value-class="pr-0" class="grid box-border min-h-full w-full bg-#333">
    <div ref="terminalElRef" class="h-full"></div>
  </Simulator>
</template>

<style scoped>
:deep(.xterm-viewport) {
  background-color: transparent !important;
}

:deep(.xterm-viewport)::-webkit-scrollbar {
  width: 13px;
}

:deep(.xterm-viewport)::-webkit-scrollbar-track {
  background-color: transparent;
}

:deep(.xterm-viewport)::-webkit-scrollbar-thumb {
  background-color: #79797966;
  border-radius: 3px;
}

:deep(.xterm-viewport)::-webkit-scrollbar-thumb:hover {
  background-color: #797979;
}
</style>
