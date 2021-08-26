"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const zod_1 = require("zod");
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const Config = zod_1.z.object({
    host: zod_1.z.string(),
    functions: zod_1.z.string(),
});
/** Read configuration from a local `convex.json` file. */
async function readConfig() {
    try {
        const config = await promises_1.default.readFile("convex.json", { encoding: "utf-8" });
        return Config.parse(JSON.parse(config));
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            console.log(chalk_1.default.red('Error: Parsing "convex.json" failed, see issues below.'));
            console.log(chalk_1.default.gray(err.toString()));
        }
        else {
            console.log(chalk_1.default.red('Error: Unable to read configuration from a "convex.json" file in your current directory.\n' +
                "Are you running this command from the root directory of a Convex app?"));
        }
        process.exit(1);
    }
}
exports.readConfig = readConfig;
