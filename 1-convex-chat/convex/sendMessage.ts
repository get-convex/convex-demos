import { mutation } from "./_generated/server";

// Send a chat message.
export default mutation(({ db }, body: string, author: string) => {
  const message = { body, author };
  db.insert("messages", message);
});
