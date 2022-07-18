import type { NextApiRequest, NextApiResponse } from "next";
import convexConfig from "../../convex.json";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(convexConfig.origin);
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
