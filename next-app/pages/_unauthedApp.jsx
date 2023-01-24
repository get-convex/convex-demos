// This file is not used in the demo app.
// Replace the contents of _auth.tsx with the contents of this file
// to use a Convex provider without authentication.

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function MyApp({ Component, pageProps }) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />;
    </ConvexProvider>
  );
}

export default MyApp;
