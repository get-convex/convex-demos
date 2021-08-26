import { AuthenticatedUser } from "./common/auth";

export type TableName = string;
export type DocumentId = string;
export type Value = any;
export type FilterCursor = string;
export type FilterQuery = object;
export type Cursor = string;
export type IndexName = string;

export interface Database {
  get(id: DocumentId): Value | null;
  insert(table: TableName, value: Value): Value;
  update(id: DocumentId, value: Value): Value;
  replace(id: DocumentId, value: Value): Value;
  find(table: TableName, query?: FilterQuery): Value | null;
  filter(
    table: TableName,
    query?: FilterQuery,
    limit?: number,
    cursor?: FilterCursor
  ): { documents: Value[]; cursor?: FilterCursor };
  remove(id: DocumentId): Value;
  trace(msg: string): null;
  putModule(path: string, source: string): null;

  table(tableName: TableName): Table;

  auth(): AuthenticatedUser | null;
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
export const ASC = "$asc";
/** Descending order, e.g. 3, 2, 1. */
export const DESC = "$desc";
/** The order to scan a range. */
export type Order = typeof ASC | typeof DESC;

type BoundInner =
  | "$beforeAll"
  | "$afterAll"
  | { $before: Array<Value> }
  | { $after: Array<Value> };

/**
 * `Bound`s are used to make `Range`s.
 *
 * A `Bound` represents the space between index keys.
 */
export class Bound {
  #inner: BoundInner;

  private constructor(inner: BoundInner) {
    this.#inner = inner;
  }

  /** A `Bound` that lies before all index keys. */
  public static readonly BEFORE_ALL: Bound = new Bound("$beforeAll");
  /** A `Bound` that lies after all index keys. */
  public static readonly AFTER_ALL: Bound = new Bound("$afterAll");
  /** A `Bound` that lies just before the index key `vs`. */
  public static before(...vs: Array<Value>): Bound {
    return new Bound({ $before: vs });
  }
  /** A `Bound` that lies just after the index key `vs`. */
  public static after(...vs: Array<Value>): Bound {
    return new Bound({ $after: vs });
  }

  public toJSON(): any {
    return this.#inner;
  }
}

/** A `Range` is a set of index keys between two bounds. */
export class Range {
  readonly #lower: Bound;
  readonly #upper: Bound;

  public constructor(lower: Bound, upper: Bound) {
    this.#lower = lower;
    this.#upper = upper;
  }

  /** A `Range` that contains all index keys. */
  public static readonly ALL: Range = new Range(
    Bound.BEFORE_ALL,
    Bound.AFTER_ALL
  );
  /** A `Range` that contains no index keys. */
  public static readonly EMPTY: Range = new Range(
    Bound.BEFORE_ALL,
    Bound.BEFORE_ALL
  );

  public get lower() {
    return this.#lower;
  }

  public get upper() {
    return this.#upper;
  }

  public toJSON(): any {
    return {
      lower: this.#lower,
      upper: this.#upper,
    };
  }
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

export type Expression =
  | { $eq: [Expression, Expression] }
  | { $neq: [Expression, Expression] }
  | { $lt: [Expression, Expression] }
  | { $lte: [Expression, Expression] }
  | { $gt: [Expression, Expression] }
  | { $gte: [Expression, Expression] }
  | { $and: Array<Expression> }
  | { $or: Array<Expression> }
  | { $not: Expression }
  | { $field: string }
  | Value;

export function field(fieldPath: string): Expression {
  return { $field: fieldPath };
}
export function eq(l: Expression, r: Expression): Expression {
  return { $eq: [l, r] };
}
export function neq(l: Expression, r: Expression): Expression {
  return { $neq: [l, r] };
}
export function lt(l: Expression, r: Expression): Expression {
  return { $lt: [l, r] };
}
export function lte(l: Expression, r: Expression): Expression {
  return { $lte: [l, r] };
}
export function gt(l: Expression, r: Expression): Expression {
  return { $gt: [l, r] };
}
export function gte(l: Expression, r: Expression): Expression {
  return { $gte: [l, r] };
}
export function and(...exprs: Array<Expression>): Expression {
  return { $and: exprs };
}
export function or(...exprs: Array<Expression>): Expression {
  return { $or: exprs };
}
export function not(a: Expression): Expression {
  return { $not: a };
}
