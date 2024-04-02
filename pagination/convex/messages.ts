import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const foo = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
    return foo;
  },
});

export const listWithExtraArg = query({
  args: { paginationOpts: paginationOptsValidator, author: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), args.author))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listWithTransformation = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...results,
      page: results.page.map((message) => ({
        author: message.author.slice(0, 1),
        body: message.body.toUpperCase(),
      })),
    };
  },
});

export const send = mutation(async (ctx, args) => {
  const { body, author } = args;
  await ctx.db.insert("messages", { body, author });
});
