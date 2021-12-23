import { dbWriter } from "@convex-dev/server";

export default async function incrementCounter(increment: number) {
  let counterDoc = await dbWriter.table("counter_table").first();
  if (counterDoc === null) {
    counterDoc = {
      counter: increment,
    };
    await dbWriter.insert("counter_table", counterDoc);
  } else {
    counterDoc.counter += increment;
    await dbWriter.update(counterDoc._id, counterDoc);
  }
  // Like console.log but relays log messages from the server to client.
  console.log(`Value of counter is now ${counterDoc.counter}`);
}
