# 3-users-and-auth

This example integrates an authentication provider (Auth0) with the chat demo
from the previous example,
[`2-filters-and-references`](https://github.com/get-convex/convex-demos/tree/main/2-filters-and-references).

The app is built with [React](https://reactjs.org/) and
[TypeScript](https://www.typescriptlang.org/), bundled using
[Vite](https://vitejs.dev/). It connects to a Convex deployment running at the
origin specified in `convex.json` using the React client.

## Documentation

This directory serves as the end state for the
[Users and Authentication](https://docs.convex.dev/getting-started/basics/users-and-auth)
tutorial.

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
