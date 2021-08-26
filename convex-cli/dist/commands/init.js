"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
class Init extends command_1.Command {
    async run() {
        this.parse(Init);
        let configFile;
        try {
            configFile = await promises_1.default.open("convex.json", "wx", 0o644);
        }
        catch (err) {
            if (err.code === "EEXIST") {
                console.log(chalk_1.default.red("Error: File convex.json already exists."));
                process.exit(1);
            }
            else {
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
        }
        finally {
            configFile.close();
        }
        console.log("Creating convex/ folder...");
        try {
            await promises_1.default.mkdir("convex");
        }
        catch (err) {
            if (err.code === "EEXIST") {
                console.log(chalk_1.default.gray("Folder already exists, skipping."));
            }
            else {
                throw err;
            }
        }
        console.log(chalk_1.default.green(`\nDone! To continue, you install "convex-sdk" in your project folder.
See the documentation at https://convex.readme.io/ for more information.`));
    }
}
exports.default = Init;
Init.description = "Initialize a new Convex app in the current directory.";
Init.examples = [
    `# In an npm project folder, with package.json file.
convex init`,
];
Init.flags = {
    help: command_1.flags.help(),
};
Init.args = [];
