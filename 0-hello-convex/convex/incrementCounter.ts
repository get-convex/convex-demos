import { mutation } from "./_generated/server";

export default mutation(async ({ db }, increment: number) => {
  let counterDoc = await db.table("counter_table").first();
  if (counterDoc === null) {
    db.insert("counter_table", {
      counter: increment,
    });
    // console.log messages appear in your browser's console and the Convex dashboard.
    console.log("Created counter.");
  } else {
    counterDoc.counter += increment;
    db.replace(counterDoc._id, counterDoc);
    console.log(`Value of counter is now ${counterDoc.counter}.`);
  }
});
