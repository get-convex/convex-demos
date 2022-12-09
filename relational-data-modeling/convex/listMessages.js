import { query } from "./_generated/server";

export default query(async ({ db }, channelId) => {
  return await db
    .query("messages")
    .filter(q => q.eq(q.field("channel"), channelId))
    .collect();
});
