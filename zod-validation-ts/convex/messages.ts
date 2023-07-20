import { mutationWithZod, queryWithZod } from "./lib/withZod";
import { z } from "zod";
import { Doc } from "./_generated/dataModel";

export const send = mutationWithZod({
  args: { body: z.string(), author: z.string() },
  handler: async (ctx, { body, author }) => {
    await ctx.db.insert("messages", { body, author });
  },
});

export const list = queryWithZod({
  args: {}, // We don't have any args to validate
  handler: async (ctx): Promise<Doc<"messages">[]> => {
    return await ctx.db.query("messages").collect();
  },
});
