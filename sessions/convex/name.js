import { mutationWithSession, queryWithSession } from "./lib/withSession";

/**
 * Gets the name from the current session.
 */
export const get = queryWithSession(async ({ session }) => {
  return session?.name ?? null;
});

/**
 * Updates the name in the current session.
 */
export const set = mutationWithSession(async ({ db, session }, name) => {
  if (!session) throw new Error("Session not initialized yet");
  db.patch(session._id, { name });
});
