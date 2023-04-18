import { httpRouter } from "convex/server";
import getMessagesByAuthor from "./getMessagesByAuthor";
import { httpAction } from "./_generated/server";

const postMessage = httpAction(async ({ runMutation }, request) => {
  const { author, body } = await request.json();

  await runMutation("sendMessage", {
    body: `Sent via HTTP action: ${body}`,
    author,
  });

  return new Response(null, {
    status: 200,
  });
});

const http = httpRouter();

http.route({
  path: "/postMessage",
  method: "POST",
  handler: postMessage,
});

// Define additional routes
http.route({
  path: "/getMessagesByAuthor",
  method: "GET",
  handler: getMessagesByAuthor,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
