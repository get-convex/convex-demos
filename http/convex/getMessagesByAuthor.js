import { httpEndpoint } from "./_generated/server";

export default httpEndpoint(async ({ runQuery }, request) => {
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

  const messages = await runQuery("listMessages");
  const filteredMessages = messages
    .filter(message => {
      return message.author === `User ${authorNumber}`;
    })
    .map(message => {
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
