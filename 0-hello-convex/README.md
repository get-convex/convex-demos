# 0-hello-convex

This example uses Convex to build a basic counter application.

The app is built with [React](https://reactjs.org/) and
[TypeScript](https://www.typescriptlang.org/), bundled using
[Vite](https://vitejs.dev/). It connects to a Convex deployment running at the
origin specified in `convex.json` using the React client.

## Documentation

This directory serves as the basis for the
[Hello Convex tutorial](https://docs.convex.dev/getting-started/hello-convex).

## Running

First run `npm install` to pull in the required dependencies including the
Convex npm package.

Login with `npx convex login`.

Initialize a convex project using `npx convex init`.

Before you can interact with the Convex Cloud you need to first deploy your
`/convex` functions with `npx convex push`. This command should be re-run any
time these functions are changed.

To run the app in development mode, use `npm run dev`. To build a production
release, use `npm run build`. You can then view the static HTML using a simple
web server with `npm run serve`.
