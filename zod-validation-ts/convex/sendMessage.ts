import { mutationWithZodObjectArg } from "./lib/withZod";
import { z } from "zod";

export default mutationWithZodObjectArg(
  { body: z.string(), author: z.string() },
  async ({ db }, { body, author }) => {
    await db.insert("messages", { body, author });
  }
);
