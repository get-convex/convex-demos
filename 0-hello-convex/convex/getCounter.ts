import { DatabaseReader } from "@convex-dev/server";

export default async function getCounter(db: DatabaseReader): Promise<number> {
  let counterDoc = await db.table("counter_table").first();
  console.log("Got stuff");
  if (counterDoc === null) {
    return 0;
  }
  return counterDoc.counter;
}
