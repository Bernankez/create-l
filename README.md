# create-l

[![npm](https://img.shields.io/npm/v/create-l?color=red&label=npm)](https://www.npmjs.com/package/create-l)
[![CI](https://github.com/Bernankez/create-l/workflows/CI/badge.svg)](https://github.com/Bernankez/create-l/actions)

**TypeScript Library Scaffold.**

## Using

```sh
# npm
$ npm create l

# yarn
$ yarn create l

# pnpm
$ pnpm create l

# bun
$ bunx create-l
```

Then you need to answer a series of questions to create the template.

You can also directly specify the project name and the template to use via additional command line options.

```sh
$ npm create l --name <projectName> --bundle <unbuild | tsup | vite>
```

The default project name is `my-lib` and the default bundle tool is `unbuild` if no project name or bundle tool is specified.

Currently supported template presets include:

- unbuild
- tsup
- vite

You can use . for the project name to scaffold in the current directory.

> [!IMPORTANT]
> Since v2.0.0, `monorepo` and `Vue SFC` templates have been removed. If you still have a need to use them, you can use cli with `legacy` tag

```sh
# npm
$ npm create l@legacy

# yarn
$ yarn create l@legacy

# pnpm
$ pnpm create l@legacy

# bun
$ bunx create-l@legacy
```
