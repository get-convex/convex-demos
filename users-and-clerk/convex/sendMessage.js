import { mutation } from "./_generated/server";

export default mutation(async ({ db, auth }, { body }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to mutation");
  }
  // Note: If you don't want to define an index right away, you can use
  // db.query("users")
  //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
  //  .unique();
  const user = await db
    .query("users")
    .withIndex("by_token", q =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }

  const message = { body, user: user._id };
  await db.insert("messages", message);
});
