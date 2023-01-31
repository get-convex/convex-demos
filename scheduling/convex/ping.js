import { mutation } from "./_generated/server";

export default mutation(async ({ db, scheduler }, author, count) => {
  const message = { body: "ping", author };
  await db.insert("messages", message);
  await scheduler.runAfter(1000, "ping:pong", author, count);
});

export const pong = mutation(async ({ db, scheduler }, author, count) => {
  const message = { body: "pong", author };
  await db.insert("messages", message);
  if (count > 1) {
    await scheduler.runAfter(1000, "ping", author, count - 1);
  }
});
