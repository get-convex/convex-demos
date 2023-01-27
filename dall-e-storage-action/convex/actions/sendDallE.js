import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import { action } from "../_generated/server";

export default action(async ({ mutation }, prompt, author) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  if (!configuration) {
    throw new Error(
      "Add your OPENAI_API_KEY as an env variable in the " +
        "[dashboard](https://dasboard.convex.dev)"
    );
  }
  const openai = new OpenAIApi(configuration);

  // Check if the prompt is offensive.
  const modResponse = await openai.createModeration({
    input: prompt,
  });
  const modResult = modResponse.data.results[0];
  if (modResult.flagged) {
    throw new Error(
      `Your prompt was flagged: ${JSON.stringify(modResult.categories)}`
    );
  }

  // Query OpenAI for the image.
  const opanaiResponse = await openai.createImage({
    prompt,
    size: "256x256",
  });
  const dallEImageUrl = opanaiResponse.data.data[0]["url"];

  // Download the image
  const imageResponse = await fetch(dallEImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`failed to download: ${imageResponse.statusText}`);
  }
  const image = Buffer.from(await imageResponse.arrayBuffer());

  // Create a Convex url to upload the image to.
  const postUrl = await mutation("sendMessage:generateUploadUrl");

  // Upload the image to Convex storage.
  const postImageResponse = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": imageResponse.headers.get("content-type") },
    body: image,
  });
  // Get the storageId for the upload.
  const { storageId } = await postImageResponse.json();

  // Write storageId as the body of the message to the Convex database.
  await mutation("sendMessage", storageId, author, "dall-e");
});
