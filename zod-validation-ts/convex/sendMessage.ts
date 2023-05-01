import { mutationWithZod } from "./lib/withZod";
import { z } from "zod";

export default mutationWithZod(
  { body: z.string(), author: z.string() },
  async ({ db }, { body, author }) => {
    await db.insert("messages", { body, author });
  }
);
