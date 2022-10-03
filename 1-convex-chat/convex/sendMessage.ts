import { mutation } from "./_generated/server";

// Send a chat message.
export default mutation(async ({ db }, body: string, author: string) => {
  const message = { body, author };
  await db.insert("messages", message);
});
