import { query } from "./_generated/server";

export default query(async ({ db }, opts) => {
  return await db.query("messages").order("desc").paginate(opts);
});
