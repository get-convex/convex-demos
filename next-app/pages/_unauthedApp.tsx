// This file is not used in the demo app.
// Replace the contents of _auth.tsx with the contents of this file
// to use a Convex provider without authentication.

import type { AppProps } from "next/app";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import clientConfig from "../convex/_generated/clientConfig";

const convex = new ConvexReactClient(clientConfig);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />;
    </ConvexProvider>
  );
}

export default MyApp;
