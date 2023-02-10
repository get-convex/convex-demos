import { mutationWithSession } from "./lib/withSession";

export default mutationWithSession(async ({ db, session }, body) => {
  const message = { body, sessionId: session._id };
  await db.insert("messages", message);
});
