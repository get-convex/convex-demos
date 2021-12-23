import { db } from "@convex-dev/server";

export default async function getCounter(): Promise<number> {
  let counterDoc = await db.table("counter_table").first();
  console.log("Got stuff");
  if (counterDoc === null) {
    return 0;
  }
  return counterDoc.counter;
}
