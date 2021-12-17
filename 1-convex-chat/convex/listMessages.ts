import { DatabaseReader, eq, field } from "@convex-dev/server";
import { Message } from "../src/common";

// List all chat messages.
export default async function listMessages(
  db: DatabaseReader
): Promise<Message[]> {
  return await db.table("messages").collect();
}
