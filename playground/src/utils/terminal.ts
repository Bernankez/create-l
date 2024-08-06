import type { Terminal } from "@xterm/xterm";

export function loading(terminal: Terminal, text: string, interval = 500) {
  const frames = [".", "..", "..."];
  let i = 0;
  terminal.write(`${text}${frames[i++]}`);
  const timer = setInterval(() => {
    clear(terminal);
    terminal.write(`${text}${frames[i++]}`);
    i %= frames.length;
  }, interval);
  return () => {
    clearInterval(timer);
    clear(terminal);
  };
}

export function clear(terminal: Terminal) {
  terminal.write("\x1B[2J\x1B[3J\x1B[H");
}
