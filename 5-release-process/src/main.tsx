import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Auth0Provider } from "@auth0/auth0-react";

// Initialize Convex Client and connect to either dev or prod
// deployments.
import convexDevConfig from "../convex.json";
import convexProdConfig from "../convex.prod.json";
const convexConfig = import.meta.env.DEV ? convexDevConfig : convexProdConfig;
const convex = new ConvexReactClient(convexConfig.origin);

ReactDOM.render(
  <StrictMode>
    <Auth0Provider
      // domain and clientId come from your Auth0 app dashboard
      domain="dev-q61vr-38.us.auth0.com"
      clientId="FOwYxKlTOxMqFUuBJU7pW1n6suEydExl"
      redirectUri={window.location.origin}
      // allows auth0 to cache the authentication state locally
      cacheLocation="localstorage"
    >
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </Auth0Provider>
  </StrictMode>,
  document.getElementById("root")
);
