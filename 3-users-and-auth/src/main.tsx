import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App, { Login } from "./App";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { ConvexReactClient } from "convex/react";
import convexConfig from "../convex.json";

const convex = new ConvexReactClient(convexConfig.origin);
const authInfo = convexConfig.authInfo[0];

ReactDOM.render(
  <StrictMode>
    <ConvexProviderWithAuth0
      client={convex}
      authInfo={authInfo}
      loggedOut={<Login />}
    >
      <App />
    </ConvexProviderWithAuth0>
  </StrictMode>,
  document.getElementById("root")
);
