# 3-external-functions

This example implements a Netlify function that calls out to a third party
(GIPHY) and writes to Convex.

The project is built with [React](https://reactjs.org/) and
[TypeScript](https://www.typescriptlang.org/), bundled using
[Vite](https://vitejs.dev/). It connects to a Convex server running at the
origin specified in `convex.json` using the JavaScript SDK.

## Documentation

This directory serves as the basis for the
[External Functions tutorial](https://docs.convex.dev/getting-started/deployment/external-functions).

## Running

First run `npm install` to pull in the required dependencies including the
Convex SDK/CLI.

Initialize a convex project using `npx convex init --beta-key <your beta key>`.

Before you can interact with the Convex Cloud you need to first deploy your
`/convex` functions with `npx convex push`. This command should be re-run any
time these functions are changed.

Deploy your Convex app to Netlify following the
[Deployment tutorial](https://docs.convex.dev/getting-started/deployment/hosting).

To run the app in development mode, install the Netlify CLI and use
`netlify dev`. To build a production release, use `npm run build`. You can then
view the static HTML using a simple web server with `npm run serve`.
