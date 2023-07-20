import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import LoginPage from "./LoginPage";
import {
  ConvexReactClient,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.render(
  <StrictMode>
    <ClerkProvider
      // Replace this with your Clerk Publishable Key
      // or with `{import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}`
      // and configure VITE_CLERK_PUBLISHABLE_KEY in your .env.local
      publishableKey="pk_test_YmlnLWNhaW1hbi01MS5jbGVyay5hY2NvdW50cy5kZXYk"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Authenticated>
          <App />
        </Authenticated>
        <Unauthenticated>
          <LoginPage />
        </Unauthenticated>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
  document.getElementById("root")
);
