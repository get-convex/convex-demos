import { dbWriter } from "@convex-dev/server";
import { Channel } from "../src/common";

// Create a new chat channel.
export default async function addChannel(name: string): Promise<Channel> {
  return await dbWriter.insert("channels", { name });
}
