import {
  addToPath,
  packages,
  forPlatform,
  getHostPlatform,
  installTo,
  mapPlatform,
  MultiPlatform,
  DownloadFile,
  Installable,
  withEnv,
  withPostInstall,
  setAlias,
  tarPackage,
  binary
} 
from "https://deno.land/x/adllang_localsetup@v0.9/mod.ts";
import * as path from "https://deno.land/std@0.105.0/path/mod.ts";

const platform = getHostPlatform();

function withPlatform<T>(multi: MultiPlatform<T>) {
  return forPlatform(multi, platform);
}

const NODE = withPlatform(packages.nodejs("18.16.0"));
const PNPM = withEnv(withPlatform(packages.pnpm("8.14.1")), () => [
  setAlias("npm", "echo \"using pnpm\"; pnpm"),
  setAlias("pn", "pnpm"),
]);

export async function main() {
  if (Deno.args.length != 1) {
    console.error("Usage: local-setup LOCALDIR");
    Deno.exit(1);
  }
  const localdir = Deno.args[0];


  const installs = [
    NODE,
    PNPM,
  ];

  await installTo(installs, localdir);
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
