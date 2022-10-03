import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// Send a message to the given chat channel.
export default mutation(
  async ({ db }, channel: Id<"channels">, body: string, author: string) => {
    const message = {
      channel,
      body,
      author,
    };
    await db.insert("messages", message);
  }
);
