import { mutationWithZod } from "./lib/withZod";
import { z } from "zod";

export default mutationWithZod({
  args: { body: z.string(), author: z.string() },
  handler: async ({ db }, { body, author }) => {
    await db.insert("messages", { body, author });
  },
});
