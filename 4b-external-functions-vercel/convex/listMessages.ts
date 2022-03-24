import { db, Id } from "@convex-dev/server";
import { Message } from "../src/common";

// List all chat messages in the given channel.
export default async function listMessages(channel: Id): Promise<Message[]> {
  const messages = await db
    .table("messages")
    .filter(q => q.eq(q.field("channel"), channel))
    .collect();
  return Promise.all(
    messages.map(async message => {
      // For each message in this channel, fetch the `User` who wrote it and
      // insert their name into the `author` field.
      if (message.user) {
        const user = await db.get(message.user.id());
        return {
          author: user.name,
          ...message,
        };
      } else {
        return message;
      }
    })
  );
}
