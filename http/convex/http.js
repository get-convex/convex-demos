import { httpRouter } from "convex/server";
import { getByAuthor } from "./messages";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const postMessage = httpAction(async ({ runMutation }, request) => {
  const { author, body } = await request.json();

  await runMutation(api.messages.send, {
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
  handler: getByAuthor,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
