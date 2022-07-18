import { mutation } from "./_generated/server";
import { Id } from "convex/values";

// Create a new chat channel.
export default mutation(async ({ db, auth }, name: string): Promise<Id> => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to addChannel");
  }
  return db.insert("channels", { name });
});
