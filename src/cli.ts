import { loadArgs } from "./load";

async function run() {
  const args = await loadArgs();
  console.log(args);
}

run();
