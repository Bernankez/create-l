import { writeFileSync } from "node:fs";
import { CheckPackages, dumpDependencies } from "taze";

export async function bumpPackages(cwd: string, recursive = false): Promise<void> {
  const packages = await checkUpdates(cwd, recursive);
  for (const filepath in packages) {
    writeFileSync(filepath, JSON.stringify(packages[filepath], null, 2));
  }
}

export async function checkUpdates(cwd: string, recursive = false): Promise<Record<string, string>> {
  // Record<filepath, updated packageJson>
  const packages: Record<string, string> = {};
  const packageInfos = await CheckPackages({
    force: true,
    mode: "latest",
    write: false,
    all: false,
    cwd,
    recursive,
  });
  for (const pkg of packageInfos.packages) {
    const { raw, resolved, filepath } = pkg;
    if (raw.dependencies) {
      raw.dependencies = dumpDependencies(resolved, "dependencies");
    }
    if (raw.devDependencies) {
      raw.devDependencies = dumpDependencies(resolved, "devDependencies");
    }
    if (raw.optionalDependencies) {
      raw.optionalDependencies = dumpDependencies(resolved, "optionalDependencies");
    }
    if (raw.packageManager) {
      const value = Object.entries(dumpDependencies(resolved, "packageManager"))[0];
      if (value) {
        raw.packageManager = `${value[0]}@${value[1].replace("^", "")}`;
      }
    }
    packages[filepath] = raw;
  }
  return packages;
}

export function packageFromUserAgent(userAgent?: string): { name: string;version: string } | undefined {
  if (!userAgent) {
    return;
  }
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}
