import { DatabaseWriter } from "@convex-dev/server";

export default async function incrementCounter(
  db: DatabaseWriter,
  increment: number
) {
  let counterDoc = await db.table("counter_table").first();
  if (counterDoc === null) {
    counterDoc = {
      counter: increment,
    };
    await db.insert("counter_table", counterDoc);
  } else {
    counterDoc.counter += increment;
    await db.update(counterDoc._id, counterDoc);
  }
  // Like console.log but relays log messages from the server to client.
  console.log(`Value of counter is now ${counterDoc.counter}`);
}
