import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

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
      <App />
    </Auth0Provider>
  </StrictMode>,
  document.getElementById("root")
);
