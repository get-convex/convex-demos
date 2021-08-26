// TODO: We use an `.mjs` file instead of TypeScript so node can run the script directly.
import pkg from "snowpack";
const { build, createConfiguration } = pkg;
import * as path from "path";
import { opendir, unlink } from "fs/promises";

if (process.argv.length !== 3) {
  throw new Error("USAGE: node bu.ndle-server.mjs <outdir>");
}

const rootFolder = "src/";
const tmpDir = process.argv[2];

// TODO: Deduplicate with `convex-sdk:register.ts`
async function* walkDir(dirPath) {
  for await (const dirEntry of await opendir(dirPath)) {
    const childPath = path.join(dirPath, dirEntry.name);
    if (dirEntry.isDirectory()) {
      yield* walkDir(childPath);
    } else if (dirEntry.isFile()) {
      yield childPath;
    }
  }
}

let config = createConfiguration({
  optimize: {
    target: "esnext",
    treeshake: true,
  },
  buildOptions: {
    out: tmpDir,
    metaUrlPath: "/_deps",
  },
  exclude: ["bin/**", "node_modules/**"],
});
config.root = path.resolve(rootFolder);
config.workspaceRoot = path.resolve("..");
config.mount = {};
config.mount[config.root] = {
  url: "/",
  static: false,
  resolve: true,
  dot: false,
};
await build({ config });

for await (const filePath of walkDir(tmpDir)) {
  const relPath = path.relative(tmpDir, filePath);
  if (path.extname(filePath) !== ".js") {
    console.log(`Skipping non-JavaScript file: ${relPath}`);
    unlink(filePath);
    continue;
  }
  console.log(`Including ${relPath}`);
}
