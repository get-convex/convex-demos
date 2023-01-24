// This file is not used in the demo app.
// Replace the contents of _auth.tsx with the contents of this file
// to use the default loading and logged out views instead of the custom
// components.

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import convexConfig from "../convex.json";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const authInfo = convexConfig.authInfo[0];

export default function MyApp({ Component, pageProps }) {
  return (
    <ConvexProviderWithAuth0 client={convex} authInfo={authInfo}>
      <Component {...pageProps} />
    </ConvexProviderWithAuth0>
  );
}
