import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// Create a new chat channel.
export default mutation(
  async ({ db, auth }, name: string): Promise<Id<"channels">> => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to addChannel");
    }
    return db.insert("channels", { name });
  }
);
