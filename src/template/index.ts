/* eslint-disable no-template-curly-in-string */
import { n } from "@bernankez/utils";
import type { PackageJson, Replacement } from "../types";

export interface PackageJsonOptions {
  projectName: string;
  packageName: string;
}

export interface PromptField {
  message: string;
  name: string;
  initial: string;
}

export function fillPackageJsonTemplate(options: Pick<Replacement, "packageName" | "projectName" | "authorEmail" | "authorName" | "description" | "version" | "githubUsername">) {
  const { projectName, packageName, authorEmail, authorName, description, version, githubUsername } = options;
  const template: PackageJson = {
    name: packageName,
    version: `${version}`,
    description: `${description}`,
    author: {
      name: `${authorName}`,
      email: `${authorEmail}`,
      url: `https://github.com/${githubUsername}`,
    },
    homepage: `https://github.com/${githubUsername}/${projectName}#readme`,
    repository: {
      type: "git",
      url: `git+https://github.com/${githubUsername}/${projectName}.git`,
    },
    bugs: `https://github.com/${githubUsername}/${projectName}/issues`,
  };
  if (!version) {
    template.version = "0.0.0";
  }
  if (!description) {
    delete template.description;
  }
  if (!authorName) {
    delete template.author?.name;
  }
  if (!authorEmail) {
    delete template.author?.email;
  }
  if (!githubUsername) {
    delete template.author?.url;
    delete template.homepage;
    delete template.repository;
    delete template.bugs;
  }
  if (template.author && Object.keys(template.author).length === 0) {
    delete template.author;
  }
  return template;
}

export function generatePackageJsonTemplate(options: PackageJsonOptions) {
  const { projectName, packageName } = options;
  const template: PackageJson = {
    name: "\${packageName}",
    version: "\${version}",
    description: "\${description}",
    author: {
      name: "\${authorName}",
      email: "\${authorEmail}",
      url: "https://github.com/\${githubUsername}",
    },
    homepage: `https://github.com/\${githubUsername}/\${projectName}#readme`,
    repository: {
      type: "git",
      url: `git+https://github.com/\${githubUsername}/\${projectName}.git`,
    },
    bugs: `https://github.com/\${githubUsername}/\${projectName}/issues`,
  };
  const fields = n([
    {
      message: "Package name",
      name: "packageName",
      initial: packageName,
    },
    {
      message: "Project name",
      name: "projectName",
      initial: projectName,
    },
    {
      message: "Author name",
      name: "authorName",
    },
    {
      message: "Version",
      name: "version",
      initial: "0.0.0",
    },
    {
      message: "Description",
      name: "description",
    },
    {
      message: "Author email",
      name: "authorEmail",
    },
    {
      message: "GitHub username",
      name: "githubUsername",
    },
  ]);

  return {
    template,
    fields,
  };
}
