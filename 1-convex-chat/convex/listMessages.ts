import { query } from "convex-dev/server";
import { Message } from "../src/common";

// List all chat messages.
export default query(async ({ db }): Promise<Message[]> => {
  return await db.table("messages").collect();
});
