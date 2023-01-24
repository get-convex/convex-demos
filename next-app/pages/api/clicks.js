import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default async function handler(req, res) {
  const clicks = await convex.query("getCounter")("clicks");
  res.status(200).json({ clicks });
}
