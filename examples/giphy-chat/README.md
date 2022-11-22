# GIPHY Chat Example App

This example app demonstrates how to use Actions to call into third-party
services. It allows the user to type a chat message like -`/giphy wombat` and
have an animated GIF of a wombat show up in the chat stream. It builds on the
Convex
[chat app with auth](https://github.com/get-convex/convex/tree/main/npm-packages/demos/examples/users-and-auth).

## Running the App

Run:

```
npm install
npx convex dev
```

Create a GIPHY [developer account](https://developers.giphy.com), obtain a free
API app key on the
[developer dashboard](https://developers.giphy.com/dashboard/), and set it as an
[environment variable](https://docs.convex.dev/using/environment-variables) with
the name `GIPHY_KEY` via the [Convex dashboard](https://dashboard.convex.dev/).

In a separate terminal:

```
npm run dev
```

Then visit [localhost:3000](http://localhost:3000).
