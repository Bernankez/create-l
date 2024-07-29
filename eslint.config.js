import bernankez from "@bernankez/eslint-config";

export default bernankez({
  unocss: true,
  formatters: {
    css: true
  },
  ignores: ["templates"],
});
