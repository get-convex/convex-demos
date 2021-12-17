import { DatabaseWriter } from "@convex-dev/server";

// Send a chat message.
export default async function sendMessage(
  db: DatabaseWriter,
  body: string,
  author: string
) {
  const message = { body, author, time: Date.now() };
  await db.insert("messages", message);
}
