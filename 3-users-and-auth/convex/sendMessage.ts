import { dbWriter, Id, auth, db, eq, field } from "@convex-dev/server";

// Send a message to the given chat channel.
export default async function sendMessage(channel: Id, body: string) {
  let identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to sendMessage");
  }
  let user = await db
    .table("users")
    .filter(eq(field("tokenIdentifier"), identity.tokenIdentifier))
    .unique();
  const message = {
    channel: channel.strongRef(),
    body,
    time: Date.now(),
    user: user._id.strongRef(),
  };
  await dbWriter.insert("messages", message);
}
