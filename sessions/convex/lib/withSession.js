import { mutation, query } from "../_generated/server";

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
export const withSession = (func, required) => {
  return async (ctx, sessionId, ...args) => {
    if (sessionId && sessionId.tableName !== "sessions")
      throw new Error("Invalid Session ID");
    const session = sessionId ? await ctx.db.get(sessionId) : null;
    if (required && !session) {
      throw new Error(
        "Session must be initialized first. " +
          "Are you wrapping your code with <SessionProvider>? " +
          "Are you requiring a session from a query that executes immediately?"
      );
    }
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
 * If the session hasn't been initialized it will throw an Error. To use a
 * muatation with an optional session instead, use mutation(withSession())
 *
 * @param func - Your function that can now take in a `session` in the ctx
 *   param.
 * @returns A Convex serverless function.
 */
export const mutationWithSession = func => {
  return mutation(withSession(func), true);
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
 * Because queries may make requests before a session is initialized, we default
 * to optional. So it is your responsibility to handle a missing session.
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
