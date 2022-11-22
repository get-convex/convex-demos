import fetch from "node-fetch";
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";

function giphyUrl(query: string) {
  return (
    "https://api.giphy.com/v1/gifs/translate?api_key=" +
    process.env.GIPHY_KEY +
    "&s=" +
    encodeURIComponent(query)
  );
}

// Post a GIF chat message corresponding to the query string.
export default action(
  async ({ mutation }, channel: Id<"channels">, query: string) => {
    // Fetch GIF url from GIPHY.
    const data = await fetch(giphyUrl(query));
    const json = await data.json();
    const gif_embed_url = json.data.embed_url;

    // Write GIF url to Convex.
    await mutation("sendMessage", channel, "giphy", gif_embed_url);
  }
);
