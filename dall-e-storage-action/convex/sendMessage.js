import { mutation } from "./_generated/server";

// Generate a short-lived upload URL.
export const generateUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

export default mutation(
  async ({ db }, body, author, format /* "text" or "dall-e" */) => {
    const message = { body, author, format };
    await db.insert("messages", message);
  }
);
