import process from 'node:process'
import { cac } from 'cac'
import { version } from '../package.json'

function loadArgs(argv = process.argv): { [k: string]: any } {
  const cli = cac('__packageName__')
  cli.version(version).help()
  const result = cli.parse(argv)
  return result.options
}

function main(): void {
  const args = loadArgs()
  // eslint-disable-next-line no-console
  console.log(args)
}

main()
