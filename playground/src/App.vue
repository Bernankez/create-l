<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import Simulator from "./components/Simulator.vue";
import { useTerminal } from "./composables/useTerminal";
import { useWebContainer } from "./composables/useWebcontainer";

const terminalElRef = ref<HTMLDivElement>();
const terminal = useTerminal(terminalElRef, {
  convertEol: true,
  cursorInactiveStyle: "none",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
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

const stop = watch(webContainer, async (webContainer) => {
  if (webContainer) {
    nextTick(() => stop());
    await webContainer.mount(files);
    let shellProcess = await webContainer.spawn("npm", ["install"], {
      terminal: {
        cols: terminal.value!.cols,
        rows: terminal.value!.rows,
      },
    });
    shellProcess = await webContainer.spawn("node", ["--version"], {
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
  <Simulator :title="status" value-class="pr-0" class="bg-#333">
    <div ref="terminalElRef" class="terminal"></div>
  </Simulator>
  <!-- <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" /> -->
  <div>{{ status }}</div>
  <!-- <div ref="terminalElRef" class="h-15.5rem w-full overflow-auto bg-gray"></div> -->
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
