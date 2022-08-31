import type { NextApiRequest, NextApiResponse } from "next";
import { ConvexHttpClient } from "convex/browser";
import clientConfig from "../../convex/_generated/clientConfig";

const convex = new ConvexHttpClient(clientConfig);
type Data = {
  clicks: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const clicks = await convex.query("getCounter")("clicks");
  res.status(200).json({ clicks });
}
