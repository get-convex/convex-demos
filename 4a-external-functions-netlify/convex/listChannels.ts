import { query } from "@convex-dev/server";
import { Channel } from "../src/common";

// List all chat channels.
export default query(async function listChannels({ db }): Promise<Channel[]> {
  return await db.table("channels").collect();
});
