import { Doc } from "./_generated/dataModel";
import { queryWithZod } from "./lib/withZod";

export default queryWithZod({
  args: {}, // We don't have any args to validate
  handler: async ({ db }): Promise<Doc<"messages">[]> => {
    return await db.query("messages").collect();
  },
});
