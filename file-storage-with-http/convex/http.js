import { httpRouter } from "convex/server";
import { httpEndpoint } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpEndpoint(async ({ storage }, request) => {
    const storageId = new URL(request.url).searchParams.get("storageId");
    const responseOrNull = await storage.get(storageId);
    if (responseOrNull === null) {
      return new Response("Image not found", {
        status: 404,
      });
    }
    return responseOrNull;
  }),
});

http.route({
  path: "/sendImage",
  method: "POST",
  handler: httpEndpoint(async ({ storage, runMutation }, request) => {
    // Store the image
    const storageId = await storage.store(request);
    const author = new URL(request.url).searchParams.get("author");

    // Save the storage ID to the messages table via a mutation
    await runMutation("sendMessage:sendImage", { storageId, author });
    return new Response(null, {
      status: 200,
      // CORS headers
      headers: new Headers({
        // e.g. https://mywebsite.com
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN,
        Vary: "origin",
      }),
    });
  }),
});

// Pre-flight request for /sendImage
http.route({
  path: "/sendImage",
  method: "OPTIONS",
  handler: httpEndpoint(async ({}, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    let headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          // e.g. https://mywebsite.com
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

export default http;
