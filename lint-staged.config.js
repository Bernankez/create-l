import micromatch from "micromatch";

export default {
  "*": (files) => {
    console.log(files);
    // TODO fix lint staged
    const match = micromatch.not(files, "**/templates/**");
    console.log(match);
    return `eslint ${match.join(" ")} --fix`;
  },
};
