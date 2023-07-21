import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});

export const list = query(async (ctx) => {
  return await ctx.db.query("messages").collect();
});
