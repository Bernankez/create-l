import micromatch from "micromatch";

export default {
  "*": (files) => {
    const match = micromatch.not(files, "**/templates/**");
    return `eslint ${match.join(" ")} --fix`;
  },
};
