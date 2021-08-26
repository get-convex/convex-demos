import Connection from "./connection";
import { parseJSON, convexReplacer } from "./index";
const apiV1Path = "/api-v1";
/** Isomorphic `fetch` for Node.js and browser usage. */
const fetch =
  typeof window !== "undefined" ? window.fetch : require("node-fetch");
/**
 * Client broker for a Convex backend. Create one per app and use it to
 * query your data, subscribe to executions of Convex functional queries or GraphQL, and
 * execute Convex transactions.
 */
export class ConvexClient {
  /**
   * Create a new client connected to a Convex backend.
   *
   * @param address Url to a Convex service, including the https:// protocol
   *                prefix.
   */
  constructor(address) {
    if (address.endsWith("/")) {
      address = address.substring(0, address.length - 1);
    }

    // This client lib speaks the Convex V1 protocol.
    address = address + apiV1Path;

    this.address = address;
    this.connection = new Connection(address);
  }
  static async parseResponse(resp) {
    let respText = await resp.text();
    return parseJSON(respText);
  }
  /**
   * Return a URL for starting the Google authentication process. Redirect to this URL to ask your user to sign in.
   */
  loginUrl() {
    return `${this.address}/start_authentication`;
  }
  /**
   * Is the Convex client currently authenticated?
   */
  isAuthenticated() {
    return this.loadCookie() !== null;
  }
  /**
   * Load authentication state (if present) from the browser's cookie.
   *
   * @returns Authentication token if present, `null` if not.
   */
  loadCookie() {
    if (typeof document === "undefined") {
      return null;
    }
    let cookieStr = document.cookie
      .split(";")
      .find((row) => row.startsWith("id="));
    if (cookieStr === undefined) {
      return null;
    }
    return cookieStr.split("=")[1];
  }
  /**
   * Load the currently authenticated user's information from the server.
   * @returns `null` if not currently authenticated, an `AuthenticatedUser`
   * object otherwise.
   */
  async authenticatedUser() {
    if (!this.isAuthenticated()) {
      return null;
    }
    if (this.cachedUser !== undefined) {
      return { ...this.cachedUser };
    }
    const cookie = this.loadCookie();
    let url = `${this.address}/authenticated_user?auth=${cookie}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    let user = await ConvexClient.parseResponse(response);
    if (user !== null) {
      this.cachedUser = { ...user };
    }
    return user;
  }
  /**
   * Clear the authentication cookie and reload the page.
   */
  logout() {
    document.cookie = "id=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.reload();
  }
  /**
   * Construct a new handle to a `Query`.
   *
   * @param name The name of the query function.
   * @returns The `Query` object with that name.
   */
  query(name) {
    return {
      call: async (args) => {
        const result = await this.invokeQuery(name, args);
        return result.value;
      },
      watch: (args, update) => {
        return this.connection.subscribe(
          () => this.invokeQuery(name, args),
          update
        );
      },
    };
  }
  /**
   * Construct a new handle to a `Transaction`.
   *
   * @param name The name of the Transaction.
   * @returns The `Transaction` object with that name.
   */
  transaction(name) {
    return {
      call: async (args) => {
        const result = await this.invokeTransaction(name, args);
        return result.value;
      },
    };
  }
  /**
   * Construct a new handle to a `GraphQLQuery`.
   *
   * @param query A GraphQL query, represented as a string.
   * @returns The `GraphQLQuery` object corresponding to that query.
   */
  graphql(query) {
    return {
      call: async (variables) => {
        const result = await this.invokeGql(query, variables);
        return result.data;
      },
      watch: (variables, update) => {
        return this.connection.subscribe(async () => {
          const result = await this.invokeGql(query, variables);
          return { value: result.data, token: result.token };
        }, update);
      },
    };
  }
  /**
   * Invoke a query on a Convex backend.
   *
   * @param name query name.
   * @param args Parameters to pass to the query.
   * @returns Object with a result attribute, which is the outcome of the query,
   *          and a token, which represents a snapshot state that can be subscribed
   *          to. When that subscription is invalidated, this query/parameter combination
   *          would return updated data.
   */
  async invokeQuery(name, args = null) {
    const argsComponent = encodeURIComponent(
      JSON.stringify(args, convexReplacer)
    );
    let url = `${this.address}/udf?path=${name}&args=${argsComponent}`;
    const cookie = this.loadCookie();
    if (cookie !== null) {
      url += `&auth=${cookie}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const parsedResponse = await ConvexClient.parseResponse(response);
    for (const line of parsedResponse.logs) {
      console.log(`%c[CONVEX Q(${name})] ${line}`, "color:blue");
    }
    if (!parsedResponse.success) {
      throw new Error(`[CONVEX Q(${name})] ${parsedResponse.value}`);
    }
    return {
      value: parsedResponse.value,
      token: parsedResponse.token,
    };
  }
  /**
   * Invoke a transaction on a Convex backend.
   *
   * Typically this is used to conduct a transactional insertion
   * or update of your backing records. Any dependent `watch`
   * methods on clients will be woken up and refreshed.
   *
   * @param name The name of the transaction to invoke.
   * @param args Arguments for that transaction.
   * @returns Return value of the transaction. Note that transactions do
   *          not return snapshot information that can be used for
   *          subscriptions; only queries do that.
   */
  async invokeTransaction(name, args = null) {
    const auth = this.loadCookie();
    const body = JSON.stringify({ path: name, args, auth }, convexReplacer);
    const response = await fetch(`${this.address}/udf`, {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const parsedResponse = await ConvexClient.parseResponse(response);
    for (const line of parsedResponse.logs) {
      console.log(`%c[CONVEX T(${name})] ${line}`, "color:green");
    }
    if (!parsedResponse.success) {
      throw new Error(`%c[CONVEX T(${name})] ${parsedResponse.value}`);
    }
    return {
      value: parsedResponse.value,
    };
  }
  /**
   * Invoke a GraphQL query on a Convex backend.
   *
   * @param query The query to invoke, as a string.
   * @param variables Variables passed to the GraphQL query.
   * @returns Return value of the query.
   */
  async invokeGql(query, variables = {}) {
    // TODO: Pass up auth for GraphQL requests.
    const body = JSON.stringify({ query, variables }, convexReplacer);
    const response = await fetch(`${this.address}/graphql`, {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await ConvexClient.parseResponse(response);
  }
  /**
   * Close any network handles associated with this client.
   *
   * Should only be invoked before destruction of the client to ensure
   * timely cleanup of sockets and resources.
   */
  close() {
    this.connection.close();
  }
}
//# sourceMappingURL=convex.js.map
