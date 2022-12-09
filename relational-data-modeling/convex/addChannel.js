import { mutation } from "./_generated/server";

export default mutation(async ({ db }, name) => {
  return db.insert("channels", { name });
});
