import { Handler } from "@netlify/functions";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "convex/values";
import fetch from "node-fetch";

import convexConfig from "../../convex.json";
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
const handler: Handler = async (event, context) => {
  const params = JSON.parse(event.body!);
  const channelId = Id.fromJSON(params.channel);
  const token = params.token;
  convex.setAuth(token);

  // Fetch GIF url from GIPHY.
  const gif = await fetch(giphyUrl(params.query))
    .then(response => response.json() as Promise<GiphyResponse>)
    .then(json => json.data.embed_url);

  // Write GIF url to Convex.
  await convex.mutation("sendMessage")(channelId, "giphy", gif);

  return {
    statusCode: 200,
    body: JSON.stringify(gif),
  };
};

export { handler };
