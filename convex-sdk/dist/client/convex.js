import Connection from "./connection";
import { parseJSON, convexReplacer } from "../index";
/** Isomorphic `fetch` for Node.js and browser usage. */
const fetch = typeof window !== "undefined" ? window.fetch : require("node-fetch");
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
        this.address = address;
        this.connection = new Connection(address);
    }
    static async parseResponse(resp) {
        let respText = await resp.text();
        return parseJSON(respText);
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
                return this.connection.subscribe(() => this.invokeQuery(name, args), update);
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
        const argsComponent = encodeURIComponent(JSON.stringify(args, convexReplacer));
        const response = await fetch(`${this.address}/udf?path=${name}&args=${argsComponent}`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await ConvexClient.parseResponse(response);
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
        const body = JSON.stringify({ path: name, args }, convexReplacer);
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
        return await ConvexClient.parseResponse(response);
    }
    /**
     * Invoke a GraphQL query on a Convex backend.
     *
     * @param query The query to invoke, as a string.
     * @param variables Variables passed to the GraphQL query.
     * @returns Return value of the query.
     */
    async invokeGql(query, variables = {}) {
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