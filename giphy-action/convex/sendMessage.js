import { mutation } from "./_generated/server";

export default mutation(
  async ({ db }, body, author, format /* "text" or "giphy" */) => {
    const message = { body, author, format };
    await db.insert("messages", message);
  }
);
