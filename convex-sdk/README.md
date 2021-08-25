# Directory layout

- `bin/build-server.mjs`: Script for Snowpack building the server SDK.
- `src/client/**`: Source for client-only SDK code, allowed to import from `src/common`.
- `src/server/**`: Source for server-only SDK code, allowed to import from `src/common`.
- `src/common/**`: Shared code between the client and server SDKs.
- `src/index.ts`: Entry point ESM for client SDK bundle (which is a npm package)
- `src/server/index.ts`: Entry point ESM for the server SDK bundle (which uses Snowpack)

# TODO

If the user is running `npm install convex-sdk`, they're going to get the client SDK in their `node_modules` folder.
This is generally what we want, but when they're editing the UDF modules within `convex`, we'll want TypeScript
to use the _server-side_ SDK. Is it okay that it'll effectively be looking at the client SDK?
