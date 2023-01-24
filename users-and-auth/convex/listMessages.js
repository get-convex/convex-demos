import { query } from "./_generated/server";

export default query(async ({ db }) => {
  const messages = await db.query("messages").collect();
  return Promise.all(
    messages.map(async message => {
      // For each message in this channel, fetch the `User` who wrote it and
      // insert their name into the `author` field.
      const user = await db.get(message.user);
      return {
        author: user.name,
        ...message,
      };
    })
  );
});
