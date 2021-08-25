var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Table_querier, _Table_tableName, _Index_querier, _Index_indexName, _Query_instances, _Query_querier, _Query_query, _Query_consume;
import { ASC, Bound, Range, } from "../common/database";
export class Table {
    constructor(querier, tableName) {
        _Table_querier.set(this, void 0);
        _Table_tableName.set(this, void 0);
        __classPrivateFieldSet(this, _Table_querier, querier, "f");
        __classPrivateFieldSet(this, _Table_tableName, tableName, "f");
    }
    fullTableScan(cursor) {
        return new Query(__classPrivateFieldGet(this, _Table_querier, "f"), {
            source: { fullTableScan: __classPrivateFieldGet(this, _Table_tableName, "f") },
            cursor: cursor,
            operators: [],
        });
    }
    index(indexName) {
        return new Index(__classPrivateFieldGet(this, _Table_querier, "f"), __classPrivateFieldGet(this, _Table_tableName, "f") + "." + indexName);
    }
}
_Table_querier = new WeakMap(), _Table_tableName = new WeakMap();
export class Index {
    constructor(querier, indexName) {
        _Index_querier.set(this, void 0);
        _Index_indexName.set(this, void 0);
        __classPrivateFieldSet(this, _Index_querier, querier, "f");
        __classPrivateFieldSet(this, _Index_indexName, indexName, "f");
    }
    range(range, order = ASC, cursor) {
        return new Query(__classPrivateFieldGet(this, _Index_querier, "f"), {
            source: {
                indexRange: {
                    indexName: __classPrivateFieldGet(this, _Index_indexName, "f"),
                    range: range,
                    order: order,
                },
            },
            cursor: cursor,
            operators: [],
        });
    }
    lookup(...key) {
        return new Query(__classPrivateFieldGet(this, _Index_querier, "f"), {
            source: {
                indexRange: {
                    indexName: __classPrivateFieldGet(this, _Index_indexName, "f"),
                    range: new Range(Bound.before(key), Bound.after(key)),
                    order: ASC,
                },
            },
            operators: [],
        });
    }
}
_Index_querier = new WeakMap(), _Index_indexName = new WeakMap();
export class Query {
    constructor(querier, query) {
        _Query_instances.add(this);
        _Query_querier.set(this, void 0);
        // access through #consume(). null once consumed.
        _Query_query.set(this, void 0);
        __classPrivateFieldSet(this, _Query_querier, querier, "f");
        __classPrivateFieldSet(this, _Query_query, query, "f");
    }
    filter(predicate) {
        const query = __classPrivateFieldGet(this, _Query_instances, "m", _Query_consume).call(this);
        query.operators.push({ filter: predicate });
        return new Query(__classPrivateFieldGet(this, _Query_querier, "f"), query);
    }
    limit(n) {
        const query = __classPrivateFieldGet(this, _Query_instances, "m", _Query_consume).call(this);
        query.operators.push({ limit: n });
        return new Query(__classPrivateFieldGet(this, _Query_querier, "f"), query);
    }
    stream() {
        return __classPrivateFieldGet(this, _Query_querier, "f").stream(__classPrivateFieldGet(this, _Query_instances, "m", _Query_consume).call(this));
    }
    page() {
        return __classPrivateFieldGet(this, _Query_querier, "f").page(__classPrivateFieldGet(this, _Query_instances, "m", _Query_consume).call(this));
    }
    first() {
        let v = this.stream().next();
        if (v.done) {
            return null;
        }
        return v.value;
    }
    unique() {
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
_Query_querier = new WeakMap(), _Query_query = new WeakMap(), _Query_instances = new WeakSet(), _Query_consume = function _Query_consume() {
    if (__classPrivateFieldGet(this, _Query_query, "f") === null) {
        throw new Error("a query can only be chained once, and cannot be chained after iteration begins");
    }
    const query = __classPrivateFieldGet(this, _Query_query, "f");
    __classPrivateFieldSet(this, _Query_query, null, "f");
    return query;
};
//# sourceMappingURL=query.js.map