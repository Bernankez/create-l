/* eslint-disable no-console */
import chalk from "chalk";

export interface LogOption {
  prefix?: string;
}

function log(str = "", options: LogOption = {}) {
  const { prefix = "" } = options;
  console.log(`${prefix}· ${str}`);
}

log.success = (str = "", options: LogOption = {}) => {
  const { prefix = "" } = options;
  console.log(chalk.green(`${prefix}✔️ ${str}`));
};
log.error = (str = "", options: LogOption = {}) => {
  const { prefix = "" } = options;
  console.log(chalk.red(`${prefix}✘ ${str}`));
};
log.warn = (str = "", options: LogOption = {}) => {
  const { prefix = "" } = options;
  console.log(chalk.yellow(`${prefix}⚠️ ${str}`));
};
log.info = (str = "", options: LogOption = {}) => {
  const { prefix = "" } = options;
  console.log(chalk.blue(`${prefix}⊙ ${str}`));
};

export { log };
