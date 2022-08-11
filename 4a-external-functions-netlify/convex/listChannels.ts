import { Document } from "./_generated/dataModel";
import { query } from "./_generated/server";

// List all chat channels.
export default query(async function listChannels({
  db,
}): Promise<Document<"channels">[]> {
  return await db.table("channels").collect();
});
