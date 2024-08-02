/// <reference types="vite/client" />

declare module "virtual:playground" {
  const playground: string;
  const packageJson: string;
  export { playground, packageJson };
}
