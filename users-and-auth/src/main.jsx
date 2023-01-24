import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import LoginPage from "./LoginPage";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import convexConfig from "../convex.json";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const authInfo = convexConfig.authInfo[0];

ReactDOM.render(
  <StrictMode>
    <ConvexProviderWithAuth0
      client={convex}
      authInfo={authInfo}
      loggedOut={<LoginPage />}
    >
      <App />
    </ConvexProviderWithAuth0>
  </StrictMode>,
  document.getElementById("root")
);
