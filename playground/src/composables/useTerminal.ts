import type { MaybeComputedElementRef } from "@vueuse/core";
import type { ITerminalInitOnlyOptions, ITerminalOptions } from "@xterm/xterm";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { shallowRef, toValue, watch } from "vue";

export function useTerminal(terminalElRef: MaybeComputedElementRef<HTMLElement | undefined>, options?: ITerminalOptions & ITerminalInitOnlyOptions) {
  const terminal = shallowRef<Terminal>();

  function init() {
    const fitAddon = new FitAddon();
    terminal.value = new Terminal(options);
    terminal.value.loadAddon(fitAddon);
    const el = toValue(terminalElRef);
    if (el) {
      terminal.value.open(el);
    }
    fitAddon.fit();
  }

  watch(() => toValue(terminalElRef), (el) => {
    if (el) {
      init();
    }
  }, {
    immediate: true,
  });

  return terminal;
}
