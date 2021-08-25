/**
 * Reconnecting WebSocket that owns a collection of query subscriptions.
 *
 * This broker will poll the backend and update the value whenever necessary.
 *
 * It queries the Convex backend to retrieve a server-side value and subscription
 * tokens that represent the version snapshot of the underlying Convex records
 * that produced that value.
 *
 * The value is given to an update callable provided by the SDK client; the token
 * is retained and multiplexed on a single WebSocket that this broker manages. In
 * this way, the broker knows if any of the query / update cycles needs to be
 * re-run because it would produce different results.
 */
declare class Connection {
    /** Address of the WebSocket (`ws://` or `wss://`) derived from parent HTTP(S) url. */
    readonly wsUri: string;
    /** Upon HTTPS/WSS failure, the first jittered backoff duration, in ms. */
    readonly initialBackoff: number;
    /** We backoff exponentially, but we need to cap that--this is the jittered max. */
    readonly maxBackoff: number;
    /** The actual WebSocket object; will be `undefined` when there are no current binds. */
    socket: WebSocket | null;
    /** Are we currently successfully connected to the backend? */
    connected: boolean;
    /**
     * Has the connection been explicitly closed by the client in
     * anticipation of destruction?
     */
    closed: boolean;
    /**
     * Current number of retries -- how many WS/HTTP connections have failed
     * in a row. This is used as the exponent in the backoff algorithm.
     */
    private retries;
    /** Current set of active subscriptions. */
    private tokenMap;
    constructor(address: string);
    /**
     * Subscribe to a backend query, automatically updating as needed.
     *
     * @param query Callable that returns the outcome of a Convex query, used to
     *              revalidate. Includes a token that is used to subscribe to
     *              invalidation messages from the server.
     * @param update Called when a new value is received from the server.
     * @returns A function that disposes of the subscription.
     */
    subscribe(query: () => Promise<any>, update: (value: any) => void): () => void;
    /**
     * Dispose of a subscription, sending a message to the socket if connected.
     *
     * @param subscription The subscription to dispose.
     */
    private dispose;
    /**
     * The poll cycle is the actual query / update loop that will invoke
     * a query and then update state based on the results.
     *
     * When it eventually succeeds doing so, it will start a subscription
     * on the token that came back from the query so it knows when to poll
     * again.
     *
     * Because this loop can re-run with timeout, and it has an asynchronous
     * HTTP call in it, there are some races against unbind that we need
     * to watch out for. It is a system invariant that only one `poll()` can be
     * running at any given moment for each subscription.
     *
     * @param subscription The subscription to poll for an update.
     */
    private poll;
    /**
     * Return the next exponential backoff.
     *
     * Generally called when a request or connection fails, as a paramter
     * to a `setTimeout` invocation of a retry.
     *
     * This not only backs off exponentially, but caps that backoff
     * at some reasonable retry cadence, and adds some jitter to smooth
     * out thundering herds on a coordinated backend failure.
     *
     * @returns The appropriate next timeout value, in milliseconds.
     */
    private backoff;
    /**
     * Upon any successful WS connection or HTTPS query invocation,
     * mark the backend as healthy.
     */
    private markHealthy;
    /** Attempt to (re)establish a WebSocket connection. Called on reconnect. */
    private connectSocket;
    /**
     * Standard websocket message received event.
     *
     * We're only using text bodies, and they're JSON.
     *
     * There is currently only one message type, and it's an object
     * with a property named `token`.
     *
     * That is a subscription token that was given by us to the backend
     * at some point that is no longer valid--meaning, some of the
     * backing records that produced the value associated with that
     * token have changed.
     *
     * If we find the subscription associated with that token--which we
     * may not, due to races between local dispose vs. remote invalidation--
     * we remove the token from our system and then start polling for
     * updated query values from the backend.
     *
     * @param event Standard browser event, `event.data` contains JSON.
     */
    private handleMessage;
    /**
     * Serialize and send a subcription event to the backend.
     *
     * The "begin" property in JSON is whether this is a subscription
     * start vs. stop. Start is sent each time we successfully poll
     * the query for a new value; stop is useful as an optimization to
     * let the server know that we stopped listening on a token.
     *
     * @param token Token to start listening to.
     * @param begin `true` to start a subscription, `false` to stop.
     */
    private sendToken;
    /**
     * Close the websocket and dispose of all subscriptions/tokens.
     */
    close(): void;
}
export default Connection;
//# sourceMappingURL=connection.d.ts.map