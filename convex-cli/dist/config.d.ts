import { z } from "zod";
declare const Config: z.ZodObject<{
    host: z.ZodString;
    functions: z.ZodString;
}, "strip", z.ZodTypeAny, {
    host: string;
    functions: string;
}, {
    host: string;
    functions: string;
}>;
export declare type Config = z.infer<typeof Config>;
/** Read configuration from a local `convex.json` file. */
export declare function readConfig(): Promise<Config>;
export {};
