import { mutation } from "./_generated/server";

function formatMessage(body, secondsLeft) {
  return `${body} (This message will self-destruct in ${secondsLeft} seconds)`;
}

export default mutation(async ({ db, scheduler }, body, author) => {
  const id = await db.insert("messages", {
    body: formatMessage(body, 5),
    author,
  });
  await scheduler.runAfter(1000, "sendExpiringMessage:update", id, body, 4);
});

export const update = mutation(
  async ({ db, scheduler }, messageId, body, secondsLeft) => {
    if (secondsLeft > 0) {
      await db.patch(messageId, { body: formatMessage(body, secondsLeft) });
      await scheduler.runAfter(
        1000,
        "sendExpiringMessage:update",
        messageId,
        body,
        secondsLeft - 1
      );
    } else {
      await db.delete(messageId);
    }
  }
);
