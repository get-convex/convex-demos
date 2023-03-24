import { mutation } from "./_generated/server";

export const sendMessage = mutation(async ({ db }, { body, author }) => {
  const message = { body, author, format: "text" };
  await db.insert("messages", message);
});

// Generate a short-lived upload URL.
export const generateUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});
// Save the storage ID within a message.
export const sendImage = mutation(async ({ db }, { storageId, author }) => {
  const message = { body: storageId, author, format: "image" };
  await db.insert("messages", message);
});
