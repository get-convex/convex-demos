import { query } from "./_generated/server";

export default query(async ({ db }, query) => {
  return await db
    .query("messages")
    .withSearchIndex("search_body", q => q.search("body", query))
    .take(10);
});
