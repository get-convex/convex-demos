import { mutation } from "convex-dev/server";

// Send a chat message.
export default mutation(({ db }, body: string, author: string) => {
  const message = { body, author, time: Date.now() };
  db.insert("messages", message);
});
