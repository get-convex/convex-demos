import { Command } from "@oclif/command";
export default class Init extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
    };
    static args: never[];
    run(): Promise<void>;
}
