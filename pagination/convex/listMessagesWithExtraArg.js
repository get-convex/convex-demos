import { query } from "./_generated/server";

export default query(async ({ db }, { paginationOpts, author }) => {
  return await db
    .query("messages")
    .filter(q => q.eq(q.field("author"), author))
    .order("desc")
    .paginate(paginationOpts);
});
