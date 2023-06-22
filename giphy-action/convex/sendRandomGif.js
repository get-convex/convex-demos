import { action, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

function randomGiphyUrl() {
    return (
      "https://api.giphy.com/v1/gifs/random?api_key=" +
      process.env.GIPHY_KEY
    )
  }

// Post a random GIF into the chat with a button.
export default action(async ({ runMutation }, { author }) => {
    // Fetch GIF url from GIPHY.
    const data = await fetch(randomGiphyUrl());
    const json = await data.json();
    if (!data.ok) {
      throw new Error(`Giphy errored: ${JSON.stringify(json)}`);
    }
    const gifEmbedUrl = json.data.embed_url;
  
    // Write GIF url to Convex.
    await runMutation(api.sendRandomGif.sendGifMessage, {
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
  