import { type MaybeComputedElementRef, useResizeObserver } from "@vueuse/core";
import type { ITerminalInitOnlyOptions, ITerminalOptions } from "@xterm/xterm";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { shallowRef, toValue, watch } from "vue";
import "@xterm/xterm/css/xterm.css";

export function useTerminal(terminalElRef: MaybeComputedElementRef<HTMLElement | undefined>, options?: ITerminalOptions & ITerminalInitOnlyOptions) {
  const terminal = shallowRef<Terminal>();
  const _fitAddon = shallowRef<FitAddon>();

  useResizeObserver(terminalElRef, () => {
    _fitAddon.value?.fit();
  });

  function init() {
    terminal.value = new Terminal(options);
    _fitAddon.value = new FitAddon();
    terminal.value.loadAddon(_fitAddon.value);
    const el = toValue(terminalElRef);
    if (el) {
      terminal.value.open(el);
      _fitAddon.value?.fit();
    }
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
