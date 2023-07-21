import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query(async (ctx) => {
  const messages = await ctx.db.query("messages").collect();
  return Promise.all(
    messages.map(async (message) => {
      // For each message in this channel, fetch the `User` who wrote it and
      // insert their name into the `author` field.
      const user = await ctx.db.get(message.user);
      return {
        author: user!.name,
        ...message,
      };
    })
  );
});

import { mutation } from "./_generated/server";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    const message = { body, user: user._id };
    await ctx.db.insert("messages", message);
  },
});
