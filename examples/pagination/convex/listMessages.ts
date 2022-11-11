import { PaginationOptions } from "convex/server";
import { query } from "./_generated/server";

export default query(async ({ db }, opts: PaginationOptions) => {
  return await db.query("messages").order("desc").paginate(opts);
});
