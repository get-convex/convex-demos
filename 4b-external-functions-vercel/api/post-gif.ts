import { ConvexHttpClient } from "convex/browser";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import convexConfig from "../convex.json";
import { Id } from "../convex/_generated/dataModel";

const convex = new ConvexHttpClient(convexConfig.origin);

// Replace this with your own GIPHY key obtained at
// https://developers.giphy.com/ -> Create Account.
const GIPHY_KEY = "QrXTp0FioARhBHalPs2tpA4RNOTLhFYs";

function giphyUrl(query: string) {
  return (
    "https://api.giphy.com/v1/gifs/translate?api_key=" +
    GIPHY_KEY +
    "&s=" +
    encodeURIComponent(query)
  );
}

interface GiphyResponse {
  data: { embed_url: string };
}

// Post a GIF chat message corresponding to the query string.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // The `VercelRequest` object automatically deserializes the request body
  // according to the `Content-Type` headers, so we don't need to manually parse
  // the JSON here.
  const params = request.body;
  const channelId = new Id("channels", params.channel);
  const token = params.token;
  convex.setAuth(token);

  // Fetch GIF url from GIPHY.
  const gif = await fetch(giphyUrl(params.query))
    .then(response => response.json() as Promise<GiphyResponse>)
    .then(json => json.data.embed_url);

  // Write GIF url to Convex.
  await convex.mutation("sendMessage")(channelId, "giphy", gif);

  response.status(200).json(gif);
}
