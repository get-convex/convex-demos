import { Id, mutation } from "@convex-dev/server";

// Create a new chat channel.
export default mutation(async ({ db, auth }, name: string): Promise<Id> => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to addChannel");
  }
  return db.insert("channels", { name });
});
