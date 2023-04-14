import { Auth0Provider } from "@auth0/auth0-react";
import {
  Authenticated,
  AuthLoading,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import LoginPage from "./LoginPage";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        <Authenticated>
          <App />
        </Authenticated>
        <Unauthenticated>
          <LoginPage />
        </Unauthenticated>
        <AuthLoading>
          <main>Loading...</main>
        </AuthLoading>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  </StrictMode>,
  document.getElementById("root")
);
