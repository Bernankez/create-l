export interface TemplateFields {
  repoType: "single";
  overwrite: boolean;
  bundleTool: BundleTool;
  additionalTools: AdditionalTool[];
  packageJson?: PackageJson;
  replacement: Replacement;
};

export type BundleTool = "unbuild" | "tsup" | "vite" | "sfc";

export type AdditionalTool = "githubAction" | "cli";

export interface Replacement {
  projectName: string;
  packageName: string;
  version?: string;
  description?: string;
  authorName?: string;
  authorEmail?: string;
  githubUsername?: string;
  gitBranchName?: string;
}

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  author?: {
    name?: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: {
    type: string;
    url?: string;
    directory?: string;
  };
  bugs?: string;
}