import {
  ASC,
  Bound,
  Cursor,
  Order,
  Expression,
  Index as IIndex,
  IndexName,
  Query as IQuery,
  Range,
  Table as ITable,
  TableName,
  Value,
} from "./database";

type SerializedQuery = {
  source: Source;
  cursor?: Cursor;
  operators: Array<QueryOperator>;
};

type Source =
  | { fullTableScan: TableName }
  | {
      indexRange: {
        indexName: IndexName;
        range: Range;
        order: Order;
      };
    };

type QueryOperator = { filter: Expression } | { limit: number };

type Querier = {
  stream: (query: object) => IterableIterator<Value>;
  page: (query: object) => [Array<Value>, Cursor | null];
};

export class Table implements ITable {
  #querier: Querier;
  #tableName: TableName;

  constructor(querier: Querier, tableName: TableName) {
    this.#querier = querier;
    this.#tableName = tableName;
  }

  fullTableScan(cursor?: Cursor): Query {
    return new Query(this.#querier, {
      source: { fullTableScan: this.#tableName },
      cursor: cursor,
      operators: [],
    });
  }

  index(indexName: IndexName): Index {
    return new Index(this.#querier, this.#tableName + "." + indexName);
  }
}

export class Index implements IIndex {
  #querier: Querier;
  #indexName: IndexName;

  constructor(querier: Querier, indexName: IndexName) {
    this.#querier = querier;
    this.#indexName = indexName;
  }

  range(range: Range, order: Order = ASC, cursor?: Cursor): Query {
    return new Query(this.#querier, {
      source: {
        indexRange: {
          indexName: this.#indexName,
          range: range,
          order: order,
        },
      },
      cursor: cursor,
      operators: [],
    });
  }

  lookup(...key: Array<Value>): Query {
    return new Query(this.#querier, {
      source: {
        indexRange: {
          indexName: this.#indexName,
          range: new Range(Bound.before(key), Bound.after(key)),
          order: ASC,
        },
      },
      operators: [],
    });
  }
}

export class Query implements IQuery {
  #querier: Querier;
  // access through #consume(). null once consumed.
  #query: SerializedQuery | null;

  constructor(querier: Querier, query: SerializedQuery) {
    this.#querier = querier;
    this.#query = query;
  }

  #consume() {
    if (this.#query === null) {
      throw new Error(
        "a query can only be chained once, and cannot be chained after iteration begins"
      );
    }
    const query = this.#query;
    this.#query = null;
    return query;
  }

  filter(predicate: Expression): Query {
    const query = this.#consume();
    query.operators.push({ filter: predicate });
    return new Query(this.#querier, query);
  }

  limit(n: number): Query {
    const query = this.#consume();
    query.operators.push({ limit: n });
    return new Query(this.#querier, query);
  }

  stream(): IterableIterator<Value> {
    return this.#querier.stream(this.#consume());
  }

  page(): [Array<Value>, Cursor | null] {
    return this.#querier.page(this.#consume());
  }

  first(): Value | null {
    let v = this.stream().next();
    if (v.done) {
      return null;
    }
    return v.value;
  }

  unique(): Value | null {
    const stream = this.stream();
    let v = stream.next();
    if (v.done) {
      throw new Error("unique() query found no results");
    }
    let v2 = stream.next();
    if (!v2.done) {
      throw new Error("unique() query returned more than one result");
    }
    return v.value;
  }
}
