"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const snowpack_1 = require("snowpack");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const os_1 = tslib_1.__importDefault(require("os"));
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const path_1 = tslib_1.__importDefault(require("path"));
const http_1 = tslib_1.__importDefault(require("http"));
const config_1 = require("../config");
function walkDir(dirPath) {
    return tslib_1.__asyncGenerator(this, arguments, function* walkDir_1() {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__asyncValues(yield tslib_1.__await(promises_1.default.opendir(dirPath))), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                const dirEntry = _c.value;
                const childPath = path_1.default.join(dirPath, dirEntry.name);
                if (dirEntry.isDirectory()) {
                    yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues(walkDir(childPath))));
                }
                else if (dirEntry.isFile()) {
                    yield yield tslib_1.__await(childPath);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
class Register extends command_1.Command {
    async run() {
        var e_2, _a;
        this.parse(Register);
        const config = await config_1.readConfig();
        const url = new URL("/put_module", config.host);
        const tmpDir = await promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), "convex-register-"));
        // For some reason, snowpack behaves differently if you pass in a `snowpack.config.mjs` file to the CLI vs. passing
        // in a `SnowpackUserConfiguration` to `createConfiguration`. Specifically, passing in 'convex' for 'root' and
        // '.' for 'workspaceRoot' ends up duplicating 'convex' twice in the final `config` object. To workaround this,
        // we create the config and manually set the `root`, `workspaceRoot`, and `mount` keys as if they came from a
        // `snowpack.config.mjs` file parsed in by `loadConfiguration`.
        let snowpackConfig = snowpack_1.createConfiguration({
            optimize: {
                target: "es2020",
                treeshake: true,
            },
            buildOptions: {
                out: tmpDir,
                metaUrlPath: "/_deps",
            },
        });
        snowpackConfig.root = path_1.default.resolve(config.functions);
        snowpackConfig.workspaceRoot = path_1.default.resolve(".");
        snowpackConfig.mount = {
            [snowpackConfig.root]: {
                url: "/",
                static: false,
                resolve: true,
                dot: false,
            },
        };
        await snowpack_1.build({ config: snowpackConfig });
        let modules = [];
        try {
            for (var _b = tslib_1.__asyncValues(walkDir(tmpDir)), _c; _c = await _b.next(), !_c.done;) {
                const filePath = _c.value;
                const relPath = path_1.default.relative(tmpDir, filePath);
                if (path_1.default.extname(filePath) !== ".js") {
                    console.log(chalk_1.default.gray(`Skipping non-JavaScript file: ${relPath}`));
                    continue;
                }
                const file = await promises_1.default.open(filePath, "r");
                const source = await file.readFile({ encoding: "utf8" });
                await file.close();
                let truncatedSource = source;
                const sourceLines = source.split("\n");
                if (sourceLines.length > 20) {
                    let truncatedLines = sourceLines.slice(0, 20);
                    truncatedLines.push("...");
                    truncatedSource = truncatedLines.join("\n");
                }
                console.log(chalk_1.default.green(`${relPath}:`) + "\n" + chalk_1.default.dim(truncatedSource));
                modules.push({ path: relPath, source });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        const requests = modules.map(({ path, source }) => {
            return new Promise((resolve, reject) => {
                const req = http_1.default.request(url, { method: "POST" }, (res) => {
                    res.on("end", () => resolve());
                });
                req.on("error", (error) => {
                    console.log(chalk_1.default.red(`Failed to register ${path}.`));
                    reject(error);
                });
                req.write(JSON.stringify({ path, source }));
                req.end();
            });
        });
        await Promise.all(requests);
        await promises_1.default.rmdir(tmpDir, { recursive: true });
    }
}
exports.default = Register;
Register.description = "Register functions to an actively running remote server.";
Register.examples = [
    `# Register files in the "convex" folder.
convex register`,
];
Register.flags = {
    help: command_1.flags.help(),
};
Register.args = [];
