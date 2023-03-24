import { internalMutation } from "./_generated/server";

export default internalMutation(async ({ db }) => {
  for (const message of await db.query("messages").collect()) {
    await db.delete(message._id);
  }
});
