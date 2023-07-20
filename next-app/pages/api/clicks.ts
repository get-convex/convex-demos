import type { NextApiRequest, NextApiResponse } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const count = async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const clicks = await convex.query(api.counter.get, { counterName: "clicks" });
  res.status(200).json({ clicks });
};
