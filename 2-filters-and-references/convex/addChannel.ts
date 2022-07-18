import { mutation } from "./_generated/server";
import { Id } from "convex/values";

// Create a new chat channel.
export default mutation(({ db }, name: string): Id => {
  return db.insert("channels", { name });
});
