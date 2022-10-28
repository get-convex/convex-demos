import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// Send a message to the given chat channel.
export default mutation(
  async (
    { db, auth },
    channel: Id<"channels">,
    format: "text" | "giphy",
    body: string
  ) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to sendMessage");
    }
    const user = await db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    const message = {
      channel,
      format,
      body,
      user: user._id,
    };
    await db.insert("messages", message);
  }
);
