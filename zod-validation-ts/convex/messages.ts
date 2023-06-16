import { mutationWithZod, queryWithZod } from "./lib/withZod";
import { z } from "zod";
import { Doc } from "./_generated/dataModel";

export const send = mutationWithZod({
  args: { body: z.string(), author: z.string() },
  handler: async ({ db }, { body, author }) => {
    await db.insert("messages", { body, author });
  },
});

export const list = queryWithZod({
  args: {}, // We don't have any args to validate
  handler: async ({ db }): Promise<Doc<"messages">[]> => {
    return await db.query("messages").collect();
  },
});
