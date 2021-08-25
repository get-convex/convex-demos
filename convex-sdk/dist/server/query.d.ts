import { Cursor, Order, Expression, Index as IIndex, IndexName, Query as IQuery, Range, Table as ITable, TableName, Value } from "../common/database";
declare type SerializedQuery = {
    source: Source;
    cursor?: Cursor;
    operators: Array<QueryOperator>;
};
declare type Source = {
    fullTableScan: TableName;
} | {
    indexRange: {
        indexName: IndexName;
        range: Range;
        order: Order;
    };
};
declare type QueryOperator = {
    filter: Expression;
} | {
    limit: number;
};
declare type Querier = {
    stream: (query: object) => IterableIterator<Value>;
    page: (query: object) => [Array<Value>, Cursor | null];
};
export declare class Table implements ITable {
    #private;
    constructor(querier: Querier, tableName: TableName);
    fullTableScan(cursor?: Cursor): Query;
    index(indexName: IndexName): Index;
}
export declare class Index implements IIndex {
    #private;
    constructor(querier: Querier, indexName: IndexName);
    range(range: Range, order?: Order, cursor?: Cursor): Query;
    lookup(...key: Array<Value>): Query;
}
export declare class Query implements IQuery {
    #private;
    constructor(querier: Querier, query: SerializedQuery);
    filter(predicate: Expression): Query;
    limit(n: number): Query;
    stream(): IterableIterator<Value>;
    page(): [Array<Value>, Cursor | null];
    first(): Value | null;
    unique(): Value | null;
}
export {};
//# sourceMappingURL=query.d.ts.map