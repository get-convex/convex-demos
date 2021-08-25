# hello-convex

This is an example of using the Convex SDK to build a basic counter application.

The project is built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/), bundled using [Vite](https://vitejs.dev/). It connects to a Convex server running at `localhost:8000` using the JavaScript SDK.

## Running

First run `npm install` to pull in the required dependencies including the Convex SDK/CLI.

The application assumes you have the Convex HTTP server running at `http://localhost:8000`.

Before you can interact with the Convex server you need to first register your `/convex` functions with `npx convex register`. This command should be re-run any time these functions are changed.

To run the app in development mode, use `npm run dev`. To build a production release, use `npm run build`. You can then view the static HTML using a simple web server with `npm run serve`.
