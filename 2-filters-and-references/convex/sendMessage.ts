import { DatabaseWriter, Id } from "@convex-dev/server";

// Send a message to the given chat channel.
export default async function sendMessage(
  db: DatabaseWriter,
  channel: Id,
  body: string,
  author: string
) {
  const message = {
    channel: channel.strongRef(),
    body,
    author,
    time: Date.now(),
  };
  await db.insert("messages", message);
}
