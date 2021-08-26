/** Isomorphic `WebSocket` for Node.js and browser usage. */
const WebSocket = typeof window !== "undefined" ? window.WebSocket : require("ws");
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
class Connection {
    constructor(address) {
        // Substitute http(s) with ws(s)
        const i = address.search("://");
        if (i == -1) {
            throw new Error("Provided address was not an absolute URL.");
        }
        const origin = address.substring(i + 3); // move past the double slash
        const protocol = address.substring(0, i);
        let wsProtocol;
        if (protocol === "http") {
            wsProtocol = "ws";
        }
        else if (protocol === "https") {
            wsProtocol = "wss";
        }
        else {
            throw new Error(`Unknown parent protocol ${protocol}`);
        }
        this.wsUri = wsProtocol + "://" + origin + "/subscribe";
        this.initialBackoff = 100;
        this.maxBackoff = 16000;
        // Initially unconnected
        this.socket = null;
        this.connected = false;
        this.retries = 0;
        this.tokenMap = {};
        this.connectSocket();
        this.closed = false;
    }
    /**
     * Subscribe to a backend query, automatically updating as needed.
     *
     * @param query Callable that returns the outcome of a Convex query, used to
     *              revalidate. Includes a token that is used to subscribe to
     *              invalidation messages from the server.
     * @param update Called when a new value is received from the server.
     * @returns A function that disposes of the subscription.
     */
    subscribe(query, update) {
        const subscription = new Subscription(query, update);
        this.poll(subscription);
        return () => this.dispose(subscription);
    }
    /**
     * Dispose of a subscription, sending a message to the socket if connected.
     *
     * @param subscription The subscription to dispose.
     */
    dispose(subscription) {
        subscription.disposed = true;
        if (subscription.token && subscription.token in this.tokenMap) {
            delete this.tokenMap[subscription.token];
            this.sendToken(subscription.token, false);
        }
    }
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
    async poll(subscription) {
        if (subscription.disposed) {
            return;
        }
        // Fetch and update the value.
        let result;
        try {
            // Okay, run the query.
            result = await subscription.query();
        }
        catch (error) {
            const backoff = this.backoff();
            console.log(`Error in data binding fetch call: ${error};\nBacking off for ${backoff}ms`);
            setTimeout(() => {
                this.poll(subscription);
            }, backoff);
            return;
        }
        // GET request to backend succeeded if we don't go into exceptional path.
        this.markHealthy();
        // We would like to subscribe and wait for mutation now. However, since
        // there was an `await` point above this part of the function, it is
        // possible that the subscription was disposed while we were waiting on the
        // query, so we exit early in this case.
        if (subscription.disposed) {
            return;
        }
        subscription.token = result.token;
        this.tokenMap[subscription.token] = subscription;
        this.sendToken(subscription.token, true);
        // Send the new value to the update callback.
        subscription.update(result.value);
    }
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
    backoff() {
        const baseBackoff = this.initialBackoff * Math.pow(2, this.retries);
        this.retries += 1;
        const actualBackoff = Math.min(baseBackoff, this.maxBackoff);
        const jitter = actualBackoff * (Math.random() - 0.5);
        return actualBackoff + jitter;
    }
    /**
     * Upon any successful WS connection or HTTPS query invocation,
     * mark the backend as healthy.
     */
    markHealthy() {
        this.retries = 0;
    }
    /** Attempt to (re)establish a WebSocket connection. Called on reconnect. */
    connectSocket() {
        this.socket = new WebSocket(this.wsUri);
        this.socket.onclose = () => {
            this.connected = false;
            if (this.closed) {
                // Do not reconnect if the client was explicitly closed.
                return;
            }
            const backoff = this.backoff();
            console.log(`Attempting reconnect in ${backoff}ms`);
            setTimeout(() => this.connectSocket(), backoff);
        };
        this.socket.onopen = () => {
            this.connected = true;
            this.markHealthy();
            Object.keys(this.tokenMap).forEach((token) => {
                this.sendToken(token, true);
            });
        };
        this.socket.onerror = (error) => {
            let message = error.message;
            console.log(`WebSocket error: ${message}`);
        };
        this.socket.onmessage = (message) => {
            this.handleMessage(message);
        };
    }
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
    handleMessage(event) {
        const data = JSON.parse(event.data);
        const { token } = data;
        if (token in this.tokenMap) {
            const subscription = this.tokenMap[token];
            delete this.tokenMap[token];
            this.poll(subscription);
        }
    }
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
    sendToken(token, begin) {
        if (this.connected) {
            const message = { token, begin };
            this.socket.send(JSON.stringify(message));
        }
    }
    /**
     * Close the websocket and dispose of all subscriptions/tokens.
     */
    close() {
        this.closed = true;
        Object.values(this.tokenMap).forEach((subscription) => {
            this.dispose(subscription);
        });
        if (this.socket !== null) {
            this.socket.close();
        }
    }
}
/**
 * A `Subscription` keeps track of the current token, value, and other
 * state associated with a `subscribe()` call.
 */
class Subscription {
    /**
     * Create a subscription record.
     * @param query  Read-only query callable
     * @param update Update function, called with the new value
     */
    constructor(query, update) {
        this.query = query;
        this.update = update;
        this.token = null;
        this.disposed = false;
    }
}
export default Connection;
//# sourceMappingURL=connection.js.map