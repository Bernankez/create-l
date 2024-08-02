<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { packageJson, playground } from "virtual:playground";
import type { WebContainer } from "@webcontainer/api";
import type { Terminal } from "@xterm/xterm";
import Simulator from "./components/Simulator.vue";
import { useTerminal } from "./composables/useTerminal";
import { useWebContainer } from "./composables/useWebcontainer";
import { loading } from "./utils/terminal";

const files = {
  "index.js": {
    file: {
      contents: playground,
    },
  },
  "package.json": {
    file: {
      contents: packageJson,
    },
  },
};

const terminalElRef = ref<HTMLDivElement>();
const terminal = useTerminal(terminalElRef, {
  convertEol: true,
  cursorInactiveStyle: "outline",
  cursorBlink: true,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
});

const { webContainer, status } = useWebContainer({
  async onBooted(webContainer) {
    await webContainer.mount(files);
  },
});

function performLoadingState() {
  let stop: (() => void) | undefined;
  return watch([terminal, status], ([terminal, status]) => {
    if (terminal) {
      switch (status) {
        case "uninitialized":
          stop = loading(terminal, "Initializing");
          break;
        case "booted":
          stop?.();
          break;
      }
    }
  }, { immediate: true });
}

performLoadingState();

async function init(webContainer: WebContainer, terminal: Terminal) {
  const stop = loading(terminal, "Installing dependencies");
  const installProcess = await webContainer.spawn("pnpm", ["install"]);
  await installProcess.exit;
  stop();
  const shellProcess = await webContainer.spawn("node", ["index.js"], {
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
  await shellProcess.exit;
  // TODO packagejson script
  // TODO refactor
  const jshProcess = await webContainer.spawn("jsh", {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });
  jshProcess.output.pipeTo(new WritableStream({
    write: (data) => {
      terminal.write(data);
    },
  }));
  const jshInputStream = jshProcess.input.getWriter();
  terminal.onData((data) => {
    jshInputStream.write(data);
  });
  useEventListener(window, "resize", () => {
    shellProcess.resize({
      cols: terminal.cols,
      rows: terminal.rows,
    });
  });
}

const stop = watch([webContainer, terminal], async ([webContainer, terminal]) => {
  if (webContainer && terminal) {
    nextTick(() => stop());
    init(webContainer, terminal);
  }
}, { immediate: true });
</script>

<template>
  <Simulator :window="false" value-class="pr-0" class="grid box-border min-h-full w-full bg-#333333">
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
