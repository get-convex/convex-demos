# HTTP Endpoint Example App

This example demonstrates how to use Convex
[HTTP endpoints](https://docs.convex.dev/using/http-endpoints).

## Running the App

To run the web app:

```
npm install
npm run dev
```

To call the endpoints (e.g. using `curl`):

```
export DEPLOYMENT_NAME="tall-sheep-123"
curl "https://$DEPLOYMENT_NAME.convex.site/getMessagesByAuthor?authorNumber=123"
curl -d '{ "author": "User 123", "body": "Hello world" }' \
    -H 'content-type: application/json' "https://$DEPLOYMENT_NAME.convex.site/postMessage"
```
