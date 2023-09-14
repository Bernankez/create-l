import { replaceWords } from "./io";

const PROJECT_NAME = "__project-name__";
const PACKAGE_NAME = "__package-name__";
const LIBRARY_NAME = "__LibraryName__";
const VERSION = "__version__";
const DESCRIPTION = "__description__";
const README_PLACEHOLDER = "__readme-placeholder__";
const AUTHOR_NAME = "__author-name__";
const AUTHOR_EMAIL = "__author-email__";
const GITHUB_USERNAME = "__github-username__";
const readmeHint = `\n- [ ] Replacing all the following fields in the project.
- \`__description__\` - Package description
- \`__author-name__\` - Author name
- \`__author-email__\` - Author email
- \`__github-username__\` - GitHub username`;

export interface Keys {
  projectName: string;
  packageName: string;
  libraryName: string;
  packageJson?: {
    version: string;
    description: string;
    authorName: string;
    authorEmail: string;
    githubUsername: string;
  };
}

export function replacePlaceholder(root: string, keys: Keys) {
  const { projectName, packageName, libraryName, packageJson } = keys;
  replaceWords(root, new RegExp(PROJECT_NAME, "g"), projectName);
  replaceWords(root, new RegExp(PACKAGE_NAME, "g"), packageName);
  replaceWords(root, new RegExp(LIBRARY_NAME, "g"), libraryName);
  if (packageJson) {
    replaceWords(root, new RegExp(VERSION, "g"), packageJson.version);
    replaceWords(root, new RegExp(DESCRIPTION, "g"), packageJson.description);
    replaceWords(root, new RegExp(AUTHOR_NAME, "g"), packageJson.authorName);
    replaceWords(root, new RegExp(AUTHOR_EMAIL, "g"), packageJson.authorEmail);
    replaceWords(root, new RegExp(GITHUB_USERNAME, "g"), packageJson.githubUsername);
    replaceWords(root, new RegExp(README_PLACEHOLDER, "g"), "");
  } else {
    replaceWords(root, new RegExp(VERSION, "g"), "0.0.0");
    replaceWords(root, new RegExp(README_PLACEHOLDER, "g"), readmeHint);
  }
}
