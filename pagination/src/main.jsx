import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import clientConfig from "../convex/_generated/clientConfig";

const convex = new ConvexReactClient(clientConfig);

ReactDOM.render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
  document.getElementById("root")
);
