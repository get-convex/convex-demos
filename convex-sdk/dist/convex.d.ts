import { AuthenticatedUser } from "./common/auth";
/**
 * Client broker for a Convex backend. Create one per app and use it to
 * query your data, subscribe to executions of Convex functional queries or GraphQL, and
 * execute Convex transactions.
 */
export declare class ConvexClient {
    readonly address: string;
    private connection;
    private cachedUser?;
    /**
     * Create a new client connected to a Convex backend.
     *
     * @param address Url to a Convex service, including the https:// protocol
     *                prefix.
     */
    constructor(address: string);
    private static parseResponse;
    /**
     * Return a URL for starting the Google authentication process. Redirect to this URL to ask your user to sign in.
     */
    loginUrl(): string;
    /**
     * Is the Convex client currently authenticated?
     */
    isAuthenticated(): boolean;
    /**
     * Load authentication state (if present) from the browser's cookie.
     *
     * @returns Authentication token if present, `null` if not.
     */
    private loadCookie;
    /**
     * Load the currently authenticated user's information from the server.
     * @returns `null` if not currently authenticated, an `AuthenticatedUser`
     * object otherwise.
     */
    authenticatedUser(): Promise<AuthenticatedUser | null>;
    /**
     * Clear the authentication cookie and reload the page.
     */
    logout(): void;
    /**
     * Construct a new handle to a `Query`.
     *
     * @param name The name of the query function.
     * @returns The `Query` object with that name.
     */
    query<ArgsType = any, ReturnType = any>(name: string): Query<ArgsType, ReturnType>;
    /**
     * Construct a new handle to a `Transaction`.
     *
     * @param name The name of the Transaction.
     * @returns The `Transaction` object with that name.
     */
    transaction<ArgsType = any, ReturnType = any>(name: string): Transaction<ArgsType, ReturnType>;
    /**
     * Construct a new handle to a `GraphQLQuery`.
     *
     * @param query A GraphQL query, represented as a string.
     * @returns The `GraphQLQuery` object corresponding to that query.
     */
    graphql<VariablesType = any, ReturnType = any>(query: string): GraphQLQuery<VariablesType, ReturnType>;
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
    private invokeQuery;
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
    private invokeTransaction;
    /**
     * Invoke a GraphQL query on a Convex backend.
     *
     * @param query The query to invoke, as a string.
     * @param variables Variables passed to the GraphQL query.
     * @returns Return value of the query.
     */
    private invokeGql;
    /**
     * Close any network handles associated with this client.
     *
     * Should only be invoked before destruction of the client to ensure
     * timely cleanup of sockets and resources.
     */
    close(): void;
}
/** A read-only query that can be executed on the Convex server. */
export declare type Query<ArgsType = any, ReturnType = any> = {
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
export declare type Transaction<ArgsType = any, ReturnType = any> = {
    /**
     * Execute the transaction on the server, returning a `Promise` of the return value.
     *
     * @param args Arguments for the transaction (default `null` if not provided).
     * @returns The returned value after the transaction has executed.
     */
    call(args?: ArgsType): Promise<ReturnType>;
};
/** A GraphQL query that can be executed on the Convex server. */
export declare type GraphQLQuery<VariablesType = any, ReturnType = any> = {
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
//# sourceMappingURL=convex.d.ts.map