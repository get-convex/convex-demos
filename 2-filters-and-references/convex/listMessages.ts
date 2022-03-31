import { query, Id } from "@convex-dev/server";
import { Message } from "../src/common";

// List all chat messages in the given channel.
export default query(async ({ db }, channel: Id): Promise<Message[]> => {
  return await db
    .table("messages")
    .filter(q => q.eq(q.field("channel"), channel))
    .collect();
});
