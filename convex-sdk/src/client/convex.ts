import Connection from "./connection";
import { parseJSON, convexReplacer } from "../index";
import { AuthenticatedUser } from "../common/database";

/** Isomorphic `fetch` for Node.js and browser usage. */
const fetch: typeof window.fetch =
  typeof window !== "undefined" ? window.fetch : require("node-fetch");

/**
 * Client broker for a Convex backend. Create one per app and use it to
 * query your data, subscribe to executions of Convex functional queries or GraphQL, and
 * execute Convex transactions.
 */
export class ConvexClient {
  readonly address: string;
  private connection: Connection;
  private cachedUser?: AuthenticatedUser;

  /**
   * Create a new client connected to a Convex backend.
   *
   * @param address Url to a Convex service, including the https:// protocol
   *                prefix.
   */
  constructor(address: string) {
    if (address.endsWith("/")) {
      address = address.substring(0, address.length - 1);
    }
    this.address = address;
    this.connection = new Connection(address);
  }

  private static async parseResponse(resp: Response): Promise<any> {
    let respText = await resp.text();
    return parseJSON(respText);
  }

  /**
   * Return a URL for starting the Google authentication process. Redirect to this URL to ask your user to sign in.
   */
  loginUrl(): string {
    return `${this.address}/start_authentication`;
  }

  /**
   * Is the Convex client currently authenticated?
   */
  isAuthenticated(): boolean {
    return this.loadCookie() !== null;
  }

  /**
   * Load authentication state (if present) from the browser's cookie.
   *
   * @returns Authentication token if present, `null` if not.
   */
  private loadCookie(): string | null {
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
  async authenticatedUser(): Promise<AuthenticatedUser | null> {
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
  query<ArgsType = any, ReturnType = any>(
    name: string
  ): Query<ArgsType, ReturnType> {
    return {
      call: async (args?: ArgsType) => {
        const result = await this.invokeQuery<ReturnType>(name, args);
        return result.value;
      },
      watch: (args: ArgsType, update: (value: ReturnType) => void) => {
        return this.connection.subscribe(
          () => this.invokeQuery<ReturnType>(name, args),
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
  transaction<ArgsType = any, ReturnType = any>(
    name: string
  ): Transaction<ArgsType, ReturnType> {
    return {
      call: async (args?: ArgsType) => {
        const result = await this.invokeTransaction<ReturnType>(name, args);
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
  graphql<VariablesType = any, ReturnType = any>(
    query: string
  ): GraphQLQuery<VariablesType, ReturnType> {
    return {
      call: async (variables?: VariablesType) => {
        const result = await this.invokeGql<ReturnType>(query, variables);
        return result.data;
      },
      watch: (
        variables: VariablesType,
        update: (value: ReturnType) => void
      ) => {
        return this.connection.subscribe(async () => {
          const result = await this.invokeGql<ReturnType>(query, variables);
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
  private async invokeQuery<T = any>(
    name: string,
    args: unknown = null
  ): Promise<{ value: T; token: string }> {
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
  private async invokeTransaction<T = any>(
    name: string,
    args: unknown = null
  ): Promise<{ value: T }> {
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
  private async invokeGql<T = any>(
    query: string,
    variables: unknown = {}
  ): Promise<{ data: T; token: string }> {
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

/** A read-only query that can be executed on the Convex server. */
export type Query<ArgsType = any, ReturnType = any> = {
  /**
   * Execute the query on the server, returning a `Promise` of the return value.
   *
   * @param args Arguments for the query (default `null` if not provided).
   * @returns The returned value after the query has executed.
   */
  call(args?: ArgsType): Promise<ReturnType>;

  /**
   * Subscribe to changes to the value returned by a query.
   *
   * @param args Arguments for the query
   * @param update Callable that will be given the value whenever it changes.
   * @returns A function that disposes of the subscription.
   */
  watch(args: ArgsType, update: (value: ReturnType) => void): () => void;
};

/** A read-write transaction that can be executed on the Convex server. */
export type Transaction<ArgsType = any, ReturnType = any> = {
  /**
   * Execute the transaction on the server, returning a `Promise` of the return value.
   *
   * @param args Arguments for the transaction (default `null` if not provided).
   * @returns The returned value after the transaction has executed.
   */
  call(args?: ArgsType): Promise<ReturnType>;
};

/** A GraphQL query that can be executed on the Convex server. */
export type GraphQLQuery<VariablesType = any, ReturnType = any> = {
  /**
   * Execute the query on the server, returning a `Promise` of the return value.
   *
   * @param variables Variables for the query (default `{}` if not provided).
   * @returns The returned data once the query has executed.
   */
  call(variables?: VariablesType): Promise<ReturnType>;

  /**
   * Subscribe to changes to the value returned by a GraphQL query.
   *
   * @param variables Variables for the query (default `{}` if not provided).
   * @param update Callable that will be given the value whenever it changes.
   * @returns A function that disposes of the subscription.
   */
  watch(args: VariablesType, update: (value: ReturnType) => void): () => void;
};
