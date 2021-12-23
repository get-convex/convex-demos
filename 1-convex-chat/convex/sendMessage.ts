import { dbWriter } from "@convex-dev/server";

// Send a chat message.
export default async function sendMessage(body: string, author: string) {
  const message = { body, author, time: Date.now() };
  await dbWriter.insert("messages", message);
}
