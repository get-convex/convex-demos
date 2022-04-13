import { mutation } from "convex-dev/server";
import { Id } from "convex-dev/values";

// Create a new chat channel.
export default mutation(({ db }, name: string): Id => {
  return db.insert("channels", { name });
});
