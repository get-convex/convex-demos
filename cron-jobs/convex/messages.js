import { internalMutation, mutation, query } from "./_generated/server";

export const list = query(async ({ db }) => {
  return await db.query("messages").collect();
});

export const send = mutation(async ({ db }, { body, author }) => {
  const message = { body, author };
  await db.insert("messages", message);
});

export const clearAll = internalMutation(async ({ db }) => {
  for (const message of await db.query("messages").collect()) {
    await db.delete(message._id);
  }
});
