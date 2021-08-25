import chalk from "chalk";
import { z, ZodError } from "zod";
import fs from "fs/promises";

const Config = z.object({
  host: z.string(),
  functions: z.string(),
});

export type Config = z.infer<typeof Config>;

/** Read configuration from a local `convex.json` file. */
export async function readConfig(): Promise<Config> {
  try {
    const config = await fs.readFile("convex.json", { encoding: "utf-8" });
    return Config.parse(JSON.parse(config));
  } catch (err) {
    if (err instanceof ZodError) {
      console.log(
        chalk.red('Error: Parsing "convex.json" failed, see issues below.')
      );
      console.log(chalk.gray(err.toString()));
    } else {
      console.log(
        chalk.red(
          'Error: Unable to read configuration from a "convex.json" file in your current directory.\n' +
            "Are you running this command from the root directory of a Convex app?"
        )
      );
    }
    process.exit(1);
  }
}
