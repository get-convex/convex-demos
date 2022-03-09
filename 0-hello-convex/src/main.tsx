import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ConvexProvider, ReactClient } from "@convex-dev/react";
import convexConfig from "../convex.json";

const convex = new ReactClient(convexConfig.origin);

ReactDOM.render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
  document.getElementById("root")
);
