import fetch from "node-fetch";
import { action } from "../_generated/server";

function giphyUrl(query) {
  return (
    "https://api.giphy.com/v1/gifs/translate?api_key=" +
    process.env.GIPHY_KEY +
    "&s=" +
    encodeURIComponent(query)
  );
}

// Post a GIF chat message corresponding to the query string.
export default action(async ({ mutation }, query, author) => {
  // Fetch GIF url from GIPHY.
  const data = await fetch(giphyUrl(query));
  const json = await data.json();
  const gif_embed_url = json.data.embed_url;

  // Write GIF url to Convex.
  await mutation("sendMessage", gif_embed_url, author, "giphy");
});
