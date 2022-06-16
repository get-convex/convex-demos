import { mutation } from "./_generated/server";

export default mutation(
  async ({ db, auth }, counterName: string, increment: number) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to addChannel");
    }
    let counterDoc = await db
      .table("counter_table")
      .filter(q => q.eq(q.field("name"), counterName))
      .first();
    if (counterDoc === null) {
      counterDoc = {
        name: counterName,
        counter: increment,
      };
      db.insert("counter_table", counterDoc);
    } else {
      counterDoc.counter += increment;
      db.replace(counterDoc._id, counterDoc);
    }
    // Like console.log but relays log messages from the server to client.
    console.log(`Value of counter is now ${counterDoc.counter}`);
  }
);
