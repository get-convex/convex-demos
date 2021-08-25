export declare type TableName = string;
export declare type DocumentId = string;
export declare type Value = any;
export declare type FilterCursor = string;
export declare type FilterQuery = object;
export declare type Cursor = string;
export declare type IndexName = string;
export interface Database {
    get(id: DocumentId): Value | null;
    insert(table: TableName, value: Value): Value;
    update(id: DocumentId, value: Value): Value;
    replace(id: DocumentId, value: Value): Value;
    find(table: TableName, query: FilterQuery): Value | null;
    filter(table: TableName, query?: FilterQuery, limit?: number, cursor?: FilterCursor): {
        documents: Value[];
        cursor?: FilterCursor;
    };
    remove(id: DocumentId): Value;
    trace(msg: string): null;
    putModule(path: string, source: string): null;
    table(tableName: TableName): Table;
}
export interface Table {
    /**
     * Query by reading all of the values out of this table. This query's cost is relative to the size
     * of the entire table, so this should only be used on tables that will stay very small (say
     * between a few hundred and a few thousand documents) and are updated infrequently.
     */
    fullTableScan(cursor?: Cursor): Query;
    index(indexName: IndexName): Index;
}
export interface Index {
    /**
     * Look up a single entry in the index by key.
     */
    lookup(...key: Array<Value>): Query;
    /**
     * Query by reading a range of an index in order. This is very efficient. The query's total cost
     * is relative to the number of documents in `range`, even if later query stages filter some out.
     */
    range(range: Range, order?: Order, cursor?: Cursor): Query;
}
/** Ascending order, e.g. 1, 2, 3. */
export declare const ASC = "$asc";
/** Descending order, e.g. 3, 2, 1. */
export declare const DESC = "$desc";
/** The order to scan a range. */
export declare type Order = typeof ASC | typeof DESC;
/**
 * `Bound`s are used to make `Range`s.
 *
 * A `Bound` represents the space between index keys.
 */
export declare class Bound {
    #private;
    private constructor();
    /** A `Bound` that lies before all index keys. */
    static readonly BEFORE_ALL: Bound;
    /** A `Bound` that lies after all index keys. */
    static readonly AFTER_ALL: Bound;
    /** A `Bound` that lies just before the index key `vs`. */
    static before(...vs: Array<Value>): Bound;
    /** A `Bound` that lies just after the index key `vs`. */
    static after(...vs: Array<Value>): Bound;
    toJSON(): any;
}
/** A `Range` is a set of index keys between two bounds. */
export declare class Range {
    #private;
    constructor(lower: Bound, upper: Bound);
    /** A `Range` that contains all index keys. */
    static readonly ALL: Range;
    /** A `Range` that contains no index keys. */
    static readonly EMPTY: Range;
    get lower(): Bound;
    get upper(): Bound;
    toJSON(): any;
}
/**
 * Query is the way to read values out of the database.
 *
 * Queries are lazily evaluated. No work is done until iteration begins, so constructing and
 * extending a query is free. The query is executed incrementally as the results are iterated over,
 * so early terminating also reduces the cost of the query.
 *
 * There are a number of methods on Query that also return Query, these can be used to refine or
 * extend the result of a query. It is more efficient to use these combinators rather than doing the
 * equivalent "manually" in UDF code.
 */
export interface Query {
    /** Filter the query output, returning only the values for which `predicate` evaluates to true. */
    filter(predicate: Expression): Query;
    /** Take at most n results from the query pipeline so far. */
    limit(n: number): Query;
    /** Begin executing the query, and stream the results. **/
    stream(): IterableIterator<Value>;
    /**
     * Execute the query, and return the entire set of results plus a cursor to continue.
     *
     * This is most useful in combination with limit().
     */
    page(): [Array<Value>, Cursor | null];
    /** Execute the query and return the first result if there is one. */
    first(): Value | null;
    /** Execute the query ensuring that there is exactly one result, and return it. */
    unique(): Value;
}
export declare type Expression = {
    $eq: [Expression, Expression];
} | {
    $neq: [Expression, Expression];
} | {
    $lt: [Expression, Expression];
} | {
    $lte: [Expression, Expression];
} | {
    $gt: [Expression, Expression];
} | {
    $gte: [Expression, Expression];
} | {
    $and: Array<Expression>;
} | {
    $or: Array<Expression>;
} | {
    $not: Expression;
} | {
    $field: string;
} | Value;
export declare function field(fieldPath: string): Expression;
export declare function eq(l: Expression, r: Expression): Expression;
export declare function neq(l: Expression, r: Expression): Expression;
export declare function lt(l: Expression, r: Expression): Expression;
export declare function lte(l: Expression, r: Expression): Expression;
export declare function gt(l: Expression, r: Expression): Expression;
export declare function gte(l: Expression, r: Expression): Expression;
export declare function and(...exprs: Array<Expression>): Expression;
export declare function or(...exprs: Array<Expression>): Expression;
export declare function not(a: Expression): Expression;
//# sourceMappingURL=database.d.ts.map