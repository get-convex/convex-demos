import { query } from "./_generated/server";

export default query(async ({ db }): Promise<number> => {
  const counterDoc = await db.table("counter_table").first();
  console.log("Got stuff");
  if (counterDoc === null) {
    return 0;
  }
  return counterDoc.counter;
});
