import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },

  handler: async ({ db }, { body, author }) => {
    const message = { body, author };
    await db.insert("messages", message);
  },
});

export const list = query(async ({ db }) => {
  return await db.query("messages").collect();
});
