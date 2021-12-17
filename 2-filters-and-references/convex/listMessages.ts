import { DatabaseReader, eq, field, Id } from "@convex-dev/server";
import { Message } from "../src/common";

// List all chat messages in the given channel.
export default async function listMessages(
  db: DatabaseReader,
  channel: Id
): Promise<Message[]> {
  if (channel === null) {
    return [];
  }
  return await db
    .table("messages")
    .filter(eq(field("channel"), channel.strongRef()))
    .collect();
}
