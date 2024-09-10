import { type MaybeRefOrGetter, nextTick, toValue, watchEffect } from "vue";
import type { Awaitable } from "@vueuse/core";
import type { SpawnOptions, WebContainer, WebContainerProcess } from "@webcontainer/api";
import type { Terminal } from "@xterm/xterm";

async function kill(process: Awaitable<WebContainerProcess>) {
  const shellProcess = await process;
  shellProcess.kill();
}

export function useProcess(webContainer: MaybeRefOrGetter<WebContainer | undefined | null>, terminal: MaybeRefOrGetter<Terminal | undefined | null>) {
  function spawn(command: string, options?: SpawnOptions): Promise<WebContainerProcess>;
  function spawn(command: string, args: string[], options?: SpawnOptions): Promise<WebContainerProcess>;
  function spawn(command: string, args?: string[] | SpawnOptions, options?: SpawnOptions): Promise<WebContainerProcess> {
    const { promise, resolve, reject } = Promise.withResolvers<WebContainerProcess>();
    const _options = (Array.isArray(args) ? options : args) || {};
    const _args = Array.isArray(args) ? args : [];

    async function handleProcess(wc: WebContainer, t: Terminal) {
      const shellProcess = await wc.spawn(command, _args, {
        terminal: {
          cols: t.cols,
          rows: t.rows,
        },
        ..._options,
      });
      shellProcess.output.pipeTo(new WritableStream({
        write(data) {
          t.write(data);
        },
      }));
      const inputState = shellProcess.input.getWriter();
      t.onData((data) => {
        inputState.write(data);
      });
      t.onResize(({ cols, rows }) => {
        shellProcess.resize({ cols, rows });
      });
      return shellProcess;
    }

    const stop = watchEffect(() => {
      const _webContainer = toValue(webContainer);
      const _terminal = toValue(terminal);
      if (_webContainer && _terminal) {
        nextTick(() => stop());
        handleProcess(_webContainer, _terminal).then(resolve, reject);
      }
    });

    return promise;
  }

  return {
    spawn,
    kill,
  };
}
