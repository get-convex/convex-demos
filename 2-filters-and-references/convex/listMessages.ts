import { Document, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

// List all chat messages in the given channel.
export default query(
  async ({ db }, channel: Id<"channels">): Promise<Document<"messages">[]> => {
    return await db
      .table("messages")
      .filter(q => q.eq(q.field("channel"), channel))
      .collect();
  }
);
