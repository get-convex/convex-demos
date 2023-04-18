import { query } from "./_generated/server";

export default query(async ({ db }, { paginationOpts }) => {
  return await db.query("messages").order("desc").paginate(paginationOpts);
});
