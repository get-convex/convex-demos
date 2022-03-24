import { dbWriter, Id, auth, db } from "@convex-dev/server";

// Send a message to the given chat channel.
export default async function sendMessage(channel: Id, body: string) {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to sendMessage");
  }
  const user = await db
    .table("users")
    .filter(q => q.eq(q.field("tokenIdentifier"), identity!.tokenIdentifier))
    .unique();
  const message = {
    channel,
    body,
    time: Date.now(),
    user: user._id,
  };
  await dbWriter.insert("messages", message);
}
