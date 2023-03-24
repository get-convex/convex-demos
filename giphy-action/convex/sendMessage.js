import { internalMutation, mutation } from "./_generated/server";

export default mutation(async ({ db }, { body, author }) => {
  const message = { body, author, format: "text" };
  await db.insert("messages", message);
});

export const sendGifMessage = internalMutation(
  async ({ db }, { body, author }) => {
    const message = { body, author, format: "giphy" };
    await db.insert("messages", message);
  }
);
