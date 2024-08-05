<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { packageJson, playground } from "virtual:playground";
import type { WebContainer } from "@webcontainer/api";
import type { Terminal } from "@xterm/xterm";
// @ts-expect-error no type def
import { common as xtermTheme } from "xterm-style";
import Simulator from "./components/Simulator.vue";
import { useTerminal } from "./composables/useTerminal";
import { useWebContainer } from "./composables/useWebcontainer";
import { loading } from "./utils/terminal";
import { process } from "./utils/webContainer";

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
  theme: xtermTheme,
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
  const createProcess = process(webContainer, terminal);
  const p1 = await createProcess("pnpm", ["install"], { output: false });
  await p1.exit;
  stop();
  // TODO directly run `pnpm create l` ?
  const p2 = await createProcess("node", ["index.js"]);
  await p2.exit;
  await createProcess("jsh");
}

const stop = watch([webContainer, terminal], async ([webContainer, terminal]) => {
  if (webContainer && terminal) {
    nextTick(() => stop());
    init(webContainer, terminal);
  }
}, { immediate: true });
</script>

<template>
  <Simulator :window="false" value-class="pr-0" class="box-border h-full w-full overflow-hidden bg-#333333">
    <!-- 100vh - py-2 -->
    <div ref="terminalElRef" class="h-[calc(100vh_-_1rem)]"></div>
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
