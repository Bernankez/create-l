import pacote from "pacote";

export async function resolvePackage(name: string) {
  const { version } = await pacote.manifest(name);
  return {
    name,
    version,
  };
}
