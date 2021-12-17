# 1-convex-chat

This example uses the Convex SDK to build a simple real-time chat app.

The project is built with [React](https://reactjs.org/) and
[TypeScript](https://www.typescriptlang.org/), bundled using
[Vite](https://vitejs.dev/). It connects to a Convex server running at the
origin specified in `convex.json` using the JavaScript SDK.

## Documentation

This directory serves as the basis for the
[Chat App tutorial](https://docs.convex.dev/getting-started/chat-app).

## Running

First run `npm install` to pull in the required dependencies including the
Convex SDK/CLI.

Initialize a convex project using
`npx convex init --email <your email address> --betaKey <your beta key>`.

Before you can interact with the Convex Cloud you need to first deploy your
`/convex` functions with `npx convex push`. This command should be re-run any
time these functions are changed.

To run the app in development mode, use `npm run dev`. To build a production
release, use `npm run build`. You can then view the static HTML using a simple
web server with `npm run serve`.
