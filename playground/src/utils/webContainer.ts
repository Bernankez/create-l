import { useEventListener } from "@vueuse/core";
import type { SpawnOptions, WebContainer, WebContainerProcess } from "@webcontainer/api";
import type { Terminal } from "@xterm/xterm";

export interface ProcessOptions {
  output?: boolean;
  options?: SpawnOptions;
}

export function process(webContainer: WebContainer, terminal: Terminal) {
  async function create(command: string, options?: ProcessOptions): Promise<WebContainerProcess>;
  async function create(command: string, args: string[], options?: ProcessOptions): Promise<WebContainerProcess>;
  async function create(command: string, _args?: string[] | ProcessOptions, _options?: ProcessOptions) {
    const args = Array.isArray(_args) ? _args : [];
    const options = Array.isArray(_args) ? _options : _args;
    const { output = true, options: spawnOptions } = options || {};

    const shellProcess = await webContainer.spawn(command, args, {
      ...(output
        ? {
            terminal: {
              cols: terminal.cols,
              rows: terminal.rows,
            },
          }
        : {}),
      ...spawnOptions,
    });
    shellProcess.output.pipeTo(new WritableStream({
      ...(output
        ? {
            write(data) {
              terminal.write(data);
            },
          }
        : {}),
    }));
    const inputStream = shellProcess.input.getWriter();
    terminal.onData((data) => {
      inputStream.write(data);
    });

    if (output) {
      const stop = useEventListener(window, "resize", () => {
        shellProcess.resize({
          cols: terminal.cols,
          rows: terminal.rows,
        });
      });

      shellProcess.exit.then(() => {
        stop();
      });
    }

    return shellProcess;
  }

  return create;
}
