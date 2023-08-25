# Users and Authentication Example App

This example demonstrates how to add users and authentication to a basic chat
app. It uses [Clerk](https://clerk.dev/) for authentication.

Users are initially presented with a "Log In" button. After user's log in, their
information is persisted to a `users` table. When users send messages, each
message is associated with the user that sent it. Lastly, users can log out with
a "Log Out" button.

## Running the App

Because this app uses authentication, it requires a bit of an additional setup.

Follow these instructions https://docs.convex.dev/auth/clerk to setup Clerk with
Convex. You will have to update the client in `main.tsx` and the server in
`auth.config.js`.
