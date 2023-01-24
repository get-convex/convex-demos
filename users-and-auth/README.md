# Users and Authentication Example App

This example demonstrates how to add users and authentication to a basic chat
app. It uses [Auth0](https://auth0.com/authentication) for authentication.

Users are initially presented with a "Log In" button. After user's log in, their
information is persisted to a `users` table. When users send messages, each
message is associated with the user that sent it. Lastly, users can log out with
a "Log Out" button.

## Running the App

Because this app uses authentication, it requires a bit of additional setup.

First, create the app with:

```
npm install
npx convex init
```

Follow these instructions https://docs.convex.dev/using/auth#auth0 to setup
Auth0.

Run

```
npx convex auth add
```

to configure Convex with your Auth0 URL and application ID. Instructions at
https://docs.convex.dev/using/auth#configuring-convex.

Finally, run:

```
npm run dev

```
