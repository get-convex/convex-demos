import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App, { LoginPage } from "./App";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { ConvexReactClient } from "convex/react";
import convexConfig from "../convex.json";
import clientConfig from "../convex/_generated/clientConfig";

const convex = new ConvexReactClient(clientConfig);
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
