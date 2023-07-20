import { httpRouter } from "convex/server";
import { postMessage, getByAuthor } from "./messages";

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
