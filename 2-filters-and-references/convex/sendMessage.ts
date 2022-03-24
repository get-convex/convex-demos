import { dbWriter, Id } from "@convex-dev/server";

// Send a message to the given chat channel.
export default async function sendMessage(
  channel: Id,
  body: string,
  author: string
) {
  const message = {
    channel,
    body,
    author,
    time: Date.now(),
  };
  await dbWriter.insert("messages", message);
}
