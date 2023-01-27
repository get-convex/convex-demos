import { Document } from "./_generated/dataModel";
import { queryWithZodArgs, addSystemFields } from "./lib/withZod";
import { z } from "zod";

export default queryWithZodArgs(
  [], // We don't have any args to validate
  async ({ db }): Promise<Document<"messages">[]> => {
    return await db.query("messages").collect();
  },
  z.array(
    z.object(
      addSystemFields("messages", { body: z.string(), author: z.string() })
    )
  )
);
