import { queryWithSession, mutationWithSession } from "./lib/withSession";

export const list = queryWithSession(async ({ db, session }) => {
  const messages = await db.query("messages").collect();
  return Promise.all(
    messages.map(async (message) => {
      const { sessionId, ...messageBody } = message;
      const author =
        session && session._id === message.sessionId
          ? session.name
          : (await db.get(sessionId)).name;
      return { author, ...messageBody };
    })
  );
});

export const send = mutationWithSession(async ({ db, session }, { body }) => {
  const message = { body, sessionId: session._id };
  await db.insert("messages", message);
});
