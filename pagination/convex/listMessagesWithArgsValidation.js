import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export default query({
  args: {
    paginationOpts: paginationOptsValidator,
  },

  handler: async ({ db }, { paginationOpts }) => {
    return await db.query("messages").order("desc").paginate(paginationOpts);
  },
});
