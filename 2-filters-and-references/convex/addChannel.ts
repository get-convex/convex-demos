import { Id, mutation } from "@convex-dev/server";

// Create a new chat channel.
export default mutation(({ db }, name: string): Id => {
  return db.insert("channels", { name });
});
