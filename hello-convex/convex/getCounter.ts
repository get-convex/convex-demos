import { Database } from "convex-sdk";

export default function getCounter(db: Database, _args: {}): number {
  let counter_doc = db.find("counter", {});
  db.trace("Got stuff");
  if (counter_doc === null) {
    return 0;
  }
  return counter_doc.counter;
}
