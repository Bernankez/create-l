import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/cli.ts',
    'src/index.ts',
  ],
  shims: true,
})
