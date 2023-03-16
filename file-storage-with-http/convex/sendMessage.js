import { mutation } from "./_generated/server";

export const sendMessage = mutation(async ({ db }, body, author) => {
  const message = { body, author };
  await db.insert("messages", message);
});

export const sendImage = mutation(async ({ db }, storageId, author) => {
  const message = { body: storageId, author, format: "image" };
  await db.insert("messages", message);
});
