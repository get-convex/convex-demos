import { Document } from "./_generated/dataModel";
import { query } from "./_generated/server";

export default query(async ({ db }): Promise<Document<"messages">[]> => {
  return await db.table("messages").collect();
});
