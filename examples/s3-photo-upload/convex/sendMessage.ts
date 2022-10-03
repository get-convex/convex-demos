import { mutation } from "./_generated/server";

// Send a chat message.
export default mutation(
  ({ db }, body: string, author: string, format: "text" | "s3") => {
    const message = { body, author, format };
    db.insert("messages", message);
  }
);
