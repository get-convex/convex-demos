import { Database } from "convex-sdk";

export default function updateCounter(db: Database, _args: {}) {
  let counterDoc = db.find("counter", {});
  if (counterDoc === null) {
    counterDoc = {
      counter: 1,
    };
    db.insert("counter", counterDoc);
  } else {
    counterDoc.counter += 1;
    db.update(counterDoc._id, counterDoc);
  }
  db.trace(`Value of counter is now ${counterDoc.counter}`);
}
