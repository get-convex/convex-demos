import { httpAction, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const postMessage = httpAction(async (ctx, request) => {
  const { author, body } = await request.json();

  await ctx.runMutation(api.messages.send, {
    body: `Sent via HTTP action: ${body}`,
    author,
  });

  return new Response(null, {
    status: 200,
  });
});

export const list = query(async (ctx) => {
  return await ctx.db.query("messages").collect();
});

export const send = mutation(async (ctx, { body, author }) => {
  const message = { body, author };
  await ctx.db.insert("messages", message);
});

export const getByAuthor = httpAction(async ({ runQuery }, request) => {
  const url = new URL(request.url);
  const authorNumber =
    url.searchParams.get("authorNumber") ??
    request.headers.get("authorNumber") ??
    null;
  if (authorNumber === null) {
    return new Response(
      "Did not specify authorNumber as query param or header",
      {
        status: 400,
      }
    );
  }

  const messages = await runQuery(api.messages.list);
  const filteredMessages = messages
    .filter((message) => {
      return message.author === `User ${authorNumber}`;
    })
    .map((message) => {
      return {
        body: message.body,
        author: message.author,
      };
    });
  return new Response(JSON.stringify(filteredMessages), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
});
