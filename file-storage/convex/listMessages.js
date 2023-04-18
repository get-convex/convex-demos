import { query } from "./_generated/server";

export default query(async ({ db, storage }) => {
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
