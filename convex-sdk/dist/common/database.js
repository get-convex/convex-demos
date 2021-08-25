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
var _Bound_inner, _Range_lower, _Range_upper;
/** Ascending order, e.g. 1, 2, 3. */
export const ASC = "$asc";
/** Descending order, e.g. 3, 2, 1. */
export const DESC = "$desc";
/**
 * `Bound`s are used to make `Range`s.
 *
 * A `Bound` represents the space between index keys.
 */
export class Bound {
    constructor(inner) {
        _Bound_inner.set(this, void 0);
        __classPrivateFieldSet(this, _Bound_inner, inner, "f");
    }
    /** A `Bound` that lies just before the index key `vs`. */
    static before(...vs) {
        return new Bound({ $before: vs });
    }
    /** A `Bound` that lies just after the index key `vs`. */
    static after(...vs) {
        return new Bound({ $after: vs });
    }
    toJSON() {
        return __classPrivateFieldGet(this, _Bound_inner, "f");
    }
}
_Bound_inner = new WeakMap();
/** A `Bound` that lies before all index keys. */
Bound.BEFORE_ALL = new Bound("$beforeAll");
/** A `Bound` that lies after all index keys. */
Bound.AFTER_ALL = new Bound("$afterAll");
/** A `Range` is a set of index keys between two bounds. */
export class Range {
    constructor(lower, upper) {
        _Range_lower.set(this, void 0);
        _Range_upper.set(this, void 0);
        __classPrivateFieldSet(this, _Range_lower, lower, "f");
        __classPrivateFieldSet(this, _Range_upper, upper, "f");
    }
    get lower() {
        return __classPrivateFieldGet(this, _Range_lower, "f");
    }
    get upper() {
        return __classPrivateFieldGet(this, _Range_upper, "f");
    }
    toJSON() {
        return {
            lower: __classPrivateFieldGet(this, _Range_lower, "f"),
            upper: __classPrivateFieldGet(this, _Range_upper, "f"),
        };
    }
}
_Range_lower = new WeakMap(), _Range_upper = new WeakMap();
/** A `Range` that contains all index keys. */
Range.ALL = new Range(Bound.BEFORE_ALL, Bound.AFTER_ALL);
/** A `Range` that contains no index keys. */
Range.EMPTY = new Range(Bound.BEFORE_ALL, Bound.BEFORE_ALL);
export function field(fieldPath) {
    return { $field: fieldPath };
}
export function eq(l, r) {
    return { $eq: [l, r] };
}
export function neq(l, r) {
    return { $neq: [l, r] };
}
export function lt(l, r) {
    return { $lt: [l, r] };
}
export function lte(l, r) {
    return { $lte: [l, r] };
}
export function gt(l, r) {
    return { $gt: [l, r] };
}
export function gte(l, r) {
    return { $gte: [l, r] };
}
export function and(...exprs) {
    return { $and: exprs };
}
export function or(...exprs) {
    return { $or: exprs };
}
export function not(a) {
    return { $not: a };
}
//# sourceMappingURL=database.js.map