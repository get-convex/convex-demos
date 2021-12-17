import { DatabaseWriter, Id } from "@convex-dev/server";
import { Channel } from "../src/common";

// Create a new chat channel.
export default async function addChannel(
  db: DatabaseWriter,
  name: string
): Promise<Channel> {
  return await db.insert("channels", { name });
}
