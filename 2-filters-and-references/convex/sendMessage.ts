import { mutation, Id } from "@convex-dev/server";

// Send a message to the given chat channel.
export default mutation(({ db }, channel: Id, body: string, author: string) => {
  const message = {
    channel,
    body,
    author,
    time: Date.now(),
  };
  db.insert("messages", message);
});
