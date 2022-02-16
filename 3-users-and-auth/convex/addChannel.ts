import { dbWriter, auth } from "@convex-dev/server";
import { Channel } from "../src/common";

// Create a new chat channel.
export default async function addChannel(name: string): Promise<Channel> {
  let identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to addChannel");
  }
  return await dbWriter.insert("channels", { name });
}
