import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query(async ({ db }, { paginationOpts }) => {
  return await db.query("messages").order("desc").paginate(paginationOpts);
});

export const listWithExtraArg = async ({ db }, { paginationOpts, author }) => {
  return await db
    .query("messages")
    .filter(q => q.eq(q.field("author"), author))
    .order("desc")
    .paginate(paginationOpts);
};

export const listWithArgsValidation = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },

  handler: async ({ db }, { paginationOpts }) => {
    return await db.query("messages").order("desc").paginate(paginationOpts);
  },
});

export const send = mutation(async ({ db }, { body, author }) => {
  const message = { body, author };
  await db.insert("messages", message);
});
