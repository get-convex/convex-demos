import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },

  handler: async ({ db }, { body, author }) => {
    const message = { body, author };
    await db.insert("messages", message);
  },
});
