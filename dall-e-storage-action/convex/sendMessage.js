import { internalMutation, mutation } from "./_generated/server";

// Generate a short-lived upload URL.
export const generateUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

export const sendDallEMessage = internalMutation(
  async ({ db }, { body, author, prompt }) => {
    const message = { body, author, format: "dall-e", prompt };
    await db.insert("messages", message);
  }
);

export default mutation(async ({ db }, { body, author }) => {
  const message = { body, author, format: "text" };
  await db.insert("messages", message);
});
