import { query, mutation } from "./_generated/server";

export const list = query(async ({ db }) => {
  return await db.query("messages").collect();
});

export const send = mutation(async ({ db }, { body, author }) => {
  const message = { body, author };
  await db.insert("messages", message);
});
