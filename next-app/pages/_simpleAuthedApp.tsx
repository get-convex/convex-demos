// This file is not used in the demo app.
// Replace the contents of _auth.tsx with the contents of this file
// to use the default loading and logged out views instead of the custom
// components.

import type { AppProps } from "next/app";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import convexConfig from "../convex.json";
import clientConfig from "../convex/_generated/clientConfig";

const convex = new ConvexReactClient(clientConfig);
const authInfo = convexConfig.authInfo[0];

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConvexProviderWithAuth0 client={convex} authInfo={authInfo}>
      <Component {...pageProps} />
    </ConvexProviderWithAuth0>
  );
}
