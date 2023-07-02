import * as p from "@clack/prompts";

function promptWrapper<Opt extends any[], T>(prompt: (...args: Opt) => Promise<T | symbol>) {
  async function wrapper(args: Opt): Promise<T>;
  async function wrapper<Res>(args: Opt, transform: (value: T) => Res): Promise<Res>;
  async function wrapper<Res>(args: Opt, transform?: (value: T) => Res) {
    const value = await prompt(...args);
    if (p.isCancel(value)) {
      p.cancel("Operation canceled");
      process.exit(0);
    }
    if (transform) {
      return transform(value);
    }
    return value;
  }

  return wrapper;
}

export const text = promptWrapper(p.text);
export const confirm = promptWrapper(p.confirm);
export const select = promptWrapper(p.select);
export const multiselect = promptWrapper(p.multiselect);

