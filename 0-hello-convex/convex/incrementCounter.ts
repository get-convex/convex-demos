import { mutation } from "./_generated/server";

export default mutation(async ({ db }, increment: number) => {
  let counterDoc = await db.table("counter_table").first();
  if (counterDoc === null) {
    counterDoc = {
      counter: increment,
    };
    db.insert("counter_table", counterDoc);
  } else {
    counterDoc.counter += increment;
    db.replace(counterDoc._id, counterDoc);
  }
  // Like console.log but relays log messages from the server to client.
  console.log(`Value of counter is now ${counterDoc.counter}`);
});
