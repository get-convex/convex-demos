import { mutation } from "./_generated/server";

// Generate a short-lived upload URL.
export const generateUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

export default mutation(
  async ({ db }, body, author, format /* "text" or "dall-e" */, prompt) => {
    const message = { body, author, format };
    if (prompt) message.prompt = prompt;
    await db.insert("messages", message);
  }
);
