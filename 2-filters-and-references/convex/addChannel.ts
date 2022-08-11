import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// Create a new chat channel.
export default mutation(({ db }, name: string): Id<"channels"> => {
  return db.insert("channels", { name });
});
