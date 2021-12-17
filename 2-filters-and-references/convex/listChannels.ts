import { DatabaseReader, eq, field, Id } from "@convex-dev/server";
import { Channel } from "../src/common";

// List all chat channels.
export default async function listChannels(
  db: DatabaseReader
): Promise<Channel[]> {
  return await db.table("channels").collect();
}
