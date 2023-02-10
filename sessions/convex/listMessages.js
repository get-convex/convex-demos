import { queryWithSession } from "./lib/withSession";

export default queryWithSession(async ({ db, session }) => {
  const messages = await db.query("messages").collect();
  return Promise.all(
    messages.map(async message => {
      const { sessionId, ...messageBody } = message;
      const author =
        session && session._id.equals(message.sessionId)
          ? session.name
          : (await db.get(sessionId)).name;
      return { author, ...messageBody };
    })
  );
});
