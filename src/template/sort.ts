import { writeFileSync } from "node:fs";
import { readJsonSync } from "fs-extra/esm";
import _sortPackageJson from "sort-package-json";

export function sortPackageJson(dest: string): void {
  const packageJson = readJsonSync(dest);
  const sorted = _sortPackageJson(packageJson);
  writeFileSync(dest, JSON.stringify(sorted, null, 2));
}
