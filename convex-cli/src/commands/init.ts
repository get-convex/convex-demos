import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import fs from "fs/promises";

export default class Init extends Command {
  static description = "Initialize a new Convex app in the current directory.";
  static examples = [
    `# In an npm project folder, with package.json file.
convex init`,
  ];
  static flags = {
    help: flags.help(),
  };
  static args = [];

  async run() {
    this.parse(Init);

    let configFile: fs.FileHandle;
    try {
      configFile = await fs.open("convex.json", "wx", 0o644);
    } catch (err) {
      if (err.code === "EEXIST") {
        console.log(chalk.red("Error: File convex.json already exists."));
        process.exit(1);
      } else {
        throw err;
      }
    }

    // TODO: We should authenticate the user and prompt them for project ID + other options.
    const config = {
      host: "https://demo-app.convex.io",
      functions: "convex/",
    };
    console.log("Writing configuration...");
    try {
      await configFile.writeFile(JSON.stringify(config, null, 2) + "\n");
    } finally {
      configFile.close();
    }

    console.log("Creating convex/ folder...");
    try {
      await fs.mkdir("convex");
    } catch (err) {
      if (err.code === "EEXIST") {
        console.log(chalk.gray("Folder already exists, skipping."));
      } else {
        throw err;
      }
    }

    console.log(
      chalk.green(`\nDone! To continue, you install "convex-sdk" in your project folder.
See the documentation at https://convex.readme.io/ for more information.`)
    );
  }
}
