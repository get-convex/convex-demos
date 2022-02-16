import { db, eq, field, Id } from "@convex-dev/server";
import { Message } from "../src/common";

// List all chat messages in the given channel.
export default async function listMessages(channel: Id): Promise<Message[]> {
  if (channel === null) {
    return [];
  }
  let messages = await db
    .table("messages")
    .filter(eq(field("channel"), channel.strongRef()))
    .collect();
  return Promise.all(
    messages.map(async (message) => {
      // For each message in this channel, fetch the `User` who wrote it and
      // insert their name into the `author` field.
      if (message.user) {
        let user = await db.get(message.user.id());
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
