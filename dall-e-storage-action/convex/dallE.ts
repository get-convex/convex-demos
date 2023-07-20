"use node";

import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const send = action(
  async (ctx, { prompt, author }: { prompt: string; author: string }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Add your OPENAI_API_KEY as an env variable in the " +
          "[dashboard](https://dasboard.convex.dev)"
      );
    }
    const configuration = new Configuration({ apiKey });
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
    const dallEImageUrl = opanaiResponse.data.data[0]["url"]!;

    // Download the image
    const imageResponse = await fetch(dallEImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`failed to download: ${imageResponse.statusText}`);
    }

    // Store the image to Convex storage.
    const image = await imageResponse.blob();
    // TODO update storage.store to accept whatever kind of Blob is returned from node-fetch
    const storageId = await ctx.storage.store(image as Blob);

    // Write storageId as the body of the message to the Convex database.
    await ctx.runMutation(internal.messages.sendDallEMessage, {
      body: storageId,
      author,
      prompt,
    });
  }
);
