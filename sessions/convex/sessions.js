import { mutation, query } from "./_generated/server";

/**
 * Wrapper for a Convex query or mutation function that provides a session in ctx.
 *
 * Requires an `Id<"sessions">` as the first parameter. This is provided by
 * default by using {@link useSessionQuery} or {@link useSessionMutation}.
 * Pass this to `query`, `mutation`, or another wrapper. E.g.:
 * ```ts
 * export default mutation(withSession(async ({ db, auth, session }, arg1) => {...}));
 * ```
 *
 * @param func - Your function that can now take in a `session` in the first param.
 * @returns A function to be passed to `query` or `mutation`.
 */
export const withSession = func => {
  return async (ctx, sessionId, ...args) => {
    if (sessionId && sessionId.tableName !== "sessions")
      throw new Error("Invalid Session ID");
    const session = sessionId ? await ctx.db.get(sessionId) : null;
    return func({ ...ctx, session }, ...args);
  };
};

/**
 * Wrapper for a Convex mutation function that provides a session in ctx.
 *
 * Requires an `Id<"sessions">` as the first parameter. This is provided by
 * default by using {@link useSessionMutation}.
 * E.g.:
 * ```ts
 * export default mutationWithSession(async ({ db, auth, session }, arg1) => {...}));
 * ```
 *
 * @param func - Your function that can now take in a `session` in the ctx
 *   param. It will be null if the session hasn't been initialized yet.
 * @returns A Convex serverless function.
 */
export const mutationWithSession = func => {
  return mutation(withSession(func));
};

/**
 * Wrapper for a Convex query function that provides a session in ctx.
 *
 * Requires an `Id<"sessions">` as the first parameter. This is provided by
 * default by using {@link useSessionQuery}.
 * E.g.:
 * ```ts
 * export default queryWithSession(async ({ db, auth, session }, arg1) => {...}));
 * ```
 *
 * @param func - Your function that can now take in a `session` in the ctx
 *   param. It will be null if the session hasn't been initialized yet.
 * @returns A Convex serverless function.
 */
export const queryWithSession = func => {
  return query(withSession(func));
};

/**
 * Creates a session and returns the ID. For use with the {@link SessionProvider} on the
 * client.
 */
export const create = mutation(async ({ db }) => {
  return db.insert("sessions", {
    name: "User " + Math.floor(Math.random() * 10000),
  });
});

/**
 * Gets the current session.
 */
export const get = queryWithSession(async ({ session }) => {
  // Depending on what sensitive data you store in here, you might
  // want to limit what you return to clients.
  return session;
});

/**
 * Updates the current session data.
 */
export const setName = mutationWithSession(async ({ db, session }, name) => {
  if (!session) throw new Error("Session not initialized yet");
  // Depending on your usecase, you might not want to allow patching
  // all or any fields from the client.
  db.patch(session._id, { name });
});
