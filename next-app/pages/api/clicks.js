import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const count = async function handler(_req, res) {
  const clicks = await convex.query(api.counter.get, { counterName: "clicks" });
  res.status(200).json({ clicks });
};
