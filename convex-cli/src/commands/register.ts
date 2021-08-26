import { Command, flags } from "@oclif/command";
import { build, createConfiguration } from "snowpack";
import chalk from "chalk";
import os from "os";
import fs from "fs/promises";
import path from "path";
import http from "http";
import { readConfig } from "../config";

async function* walkDir(dirPath: string): AsyncGenerator<string, void, void> {
  for await (const dirEntry of await fs.opendir(dirPath)) {
    const childPath = path.join(dirPath, dirEntry.name);
    if (dirEntry.isDirectory()) {
      yield* walkDir(childPath);
    } else if (dirEntry.isFile()) {
      yield childPath;
    }
  }
}

export default class Register extends Command {
  static description =
    "Register functions to an actively running remote server.";
  static examples = [
    `# Register files in the "convex" folder.
convex register`,
  ];
  static flags = {
    help: flags.help(),
  };
  static args = [];

  async run() {
    this.parse(Register);

    const config = await readConfig();

    const url = new URL("/api-v1/put_module", config.host);

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "convex-register-"));

    // For some reason, snowpack behaves differently if you pass in a `snowpack.config.mjs` file to the CLI vs. passing
    // in a `SnowpackUserConfiguration` to `createConfiguration`. Specifically, passing in 'convex' for 'root' and
    // '.' for 'workspaceRoot' ends up duplicating 'convex' twice in the final `config` object. To workaround this,
    // we create the config and manually set the `root`, `workspaceRoot`, and `mount` keys as if they came from a
    // `snowpack.config.mjs` file parsed in by `loadConfiguration`.
    let snowpackConfig = createConfiguration({
      optimize: {
        target: "es2020",
        treeshake: true,
      },
      buildOptions: {
        out: tmpDir,
        metaUrlPath: "/_deps",
      },
    });
    snowpackConfig.root = path.resolve(config.functions);
    snowpackConfig.workspaceRoot = path.resolve(".");
    snowpackConfig.mount = {
      [snowpackConfig.root]: {
        url: "/",
        static: false,
        resolve: true,
        dot: false,
      },
    };
    await build({ config: snowpackConfig });

    let modules = [];
    for await (const filePath of walkDir(tmpDir)) {
      const relPath = path.relative(tmpDir, filePath);
      if (path.extname(filePath) !== ".js") {
        console.log(chalk.gray(`Skipping non-JavaScript file: ${relPath}`));
        continue;
      }
      const file = await fs.open(filePath, "r");
      const source = await file.readFile({ encoding: "utf8" });
      await file.close();

      let truncatedSource = source;
      const sourceLines = source.split("\n");
      if (sourceLines.length > 20) {
        let truncatedLines = sourceLines.slice(0, 20);
        truncatedLines.push("...");
        truncatedSource = truncatedLines.join("\n");
      }
      console.log(
        chalk.green(`${relPath}:`) + "\n" + chalk.dim(truncatedSource)
      );
      modules.push({ path: relPath, source });
    }
    const requests = modules.map(({ path, source }) => {
      return new Promise<void>((resolve, reject) => {
        const req = http.request(url, { method: "POST" }, (res) => {
          res.on("end", () => resolve());
        });
        req.on("error", (error) => {
          console.log(chalk.red(`Failed to register ${path}.`));
          reject(error);
        });
        req.write(JSON.stringify({ path, source }));
        req.end();
      });
    });

    await Promise.all(requests);
    await fs.rmdir(tmpDir, { recursive: true });
  }
}
