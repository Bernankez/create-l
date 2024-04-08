export type TemplateFields = SingleRepoFields | MonorepoFields;

export interface SingleRepoFields {
  repoType: "single";
  overwrite: boolean;
  bundleTool: BundleTool;
  additionalTools: AdditionalTool[];
  replacement: Replacement;
}

export interface MonorepoFields {
  repoType: "mono";
  overwrite: boolean;
  githubAction: boolean;
}

export type RepoType = "mono" | "single";

export type BundleTool = "unbuild" | "tsup" | "vite";

export type AdditionalTool = "githubAction";

export interface Replacement {
  projectName: string;
  packageName: string;
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
