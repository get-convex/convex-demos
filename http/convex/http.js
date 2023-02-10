import { httpRouter } from "convex/server";
import getMessagesByAuthor from "./getMessagesByAuthor";
import { httpEndpoint } from "./_generated/server";

const postMessage = httpEndpoint(async ({ runMutation }, request) => {
  const { author, body } = await request.json();

  await runMutation("sendMessage", `Sent via HTTP endpoint: ${body}`, author);
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
