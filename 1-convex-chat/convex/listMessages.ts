import { db } from "@convex-dev/server";
import { Message } from "../src/common";

// List all chat messages.
export default async function listMessages(): Promise<Message[]> {
  return await db.table("messages").collect();
}
