import { mutationWithSession } from "./sessions";

export default mutationWithSession(async ({ db, session }, body) => {
  if (!session) throw new Error("Session not initialized yet");
  const message = { body, sessionId: session._id };
  await db.insert("messages", message);
});
