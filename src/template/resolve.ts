import pacote from "pacote";

export async function resolvePackage(name: string): Promise<{ name: string;version: string }> {
  const { version } = await pacote.manifest(name);
  return {
    name,
    version,
  };
}
