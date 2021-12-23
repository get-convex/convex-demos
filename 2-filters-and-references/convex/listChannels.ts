import { db } from "@convex-dev/server";
import { Channel } from "../src/common";

// List all chat channels.
export default async function listChannels(): Promise<Channel[]> {
  return await db.table("channels").collect();
}
