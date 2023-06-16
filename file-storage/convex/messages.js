import { query } from "./_generated/server";

export const list = query(async ({ db, storage }) => {
  const messages = await db.query("messages").collect();
  return Promise.all(
    messages.map(async message => ({
      ...message,
      // If the message is an "image" its `body` is a `StorageId`
      ...(message.format === "image"
        ? { url: await storage.getUrl(message.body) }
        : {}),
    }))
  );
});

import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

export const sendImage = mutation(async ({ db }, { storageId, author }) => {
  const message = { body: storageId, author, format: "image" };
  await db.insert("messages", message);
});

export const sendMessage = mutation(async ({ db }, { body, author }) => {
  const message = { body, author, format: "text" };
  await db.insert("messages", message);
});
