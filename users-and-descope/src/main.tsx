import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import LoginPage from "./LoginPage";
import {
  ConvexReactClient,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithDescope } from "convex/react-descope";
import { AuthProvider } from "@descope/react-sdk";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider
      // Replace this with your Descope Project ID
      // or with `{import.meta.env.VITE_DESCOPE_PROJECT_ID}`
      // and configure VITE_DESCOPE_PROJECT_ID in your .env.local
      projectId="P2OkfVnJi5Ht7mpCqHjx17nV5epH"
    >
      <ConvexProviderWithDescope client={convex}>
        <Authenticated>
          <App />
        </Authenticated>
        <Unauthenticated>
          <LoginPage />
        </Unauthenticated>
      </ConvexProviderWithDescope>
    </AuthProvider>
  </StrictMode>,
);
