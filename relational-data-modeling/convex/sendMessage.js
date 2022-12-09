import { mutation } from "./_generated/server";

export default mutation(async ({ db }, channel, body, author) => {
  const message = { channel, body, author };
  await db.insert("messages", message);
});
