import bernankez from "@bernankez/eslint-config";

export default bernankez({
  ignores: ["templates"],
  unocss: true,
  formatters: {
    css: true,
  },
}, [
  {
    files: ["!playground/**/*"],
    rules: {
      "ts/explicit-function-return-type": ["error", {
        allowExpressions: true,
        allowHigherOrderFunctions: true,
        allowIIFEs: true,
      }],
    },
  },
]);
