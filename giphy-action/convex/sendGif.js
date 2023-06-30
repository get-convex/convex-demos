import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

function giphyUrl(queryString) {
  return (
    "https://api.giphy.com/v1/gifs/translate?api_key=" +
    process.env.GIPHY_KEY +
    "&s=" +
    encodeURIComponent(queryString)
  );
}

// Post a GIF chat message corresponding to the query string.
export default action(async ({ runMutation }, { queryString, author }) => {
  // Fetch GIF url from GIPHY.
  const data = await fetch(giphyUrl(queryString));
  const json = await data.json();
  if (!data.ok) {
    throw new Error(`Giphy errored: ${JSON.stringify(json)}`);
  }
  const gifEmbedUrl = json.data.embed_url;

  // Write GIF url to Convex.
  await runMutation(internal.sendGif.sendGifMessage, {
    body: gifEmbedUrl,
    author,
  });
});

export const sendGifMessage = internalMutation(
  async ({ db }, { body, author }) => {
    const message = { body, author, format: "giphy" };
    await db.insert("messages", message);
  }
);
