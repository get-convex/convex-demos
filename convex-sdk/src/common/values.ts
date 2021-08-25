import Long from "long";
import * as Base64 from "base64-js";

export function convexReviver(key: string, value: any): any {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if ("$binary" in value) {
    return Base64.toByteArray(value.$binary).buffer;
  }
  if ("$integer" in value) {
    const integerBytes = Base64.toByteArray(value.$integer);
    if (integerBytes.byteLength !== 8) {
      throw new Error(
        `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
      );
    }
    return Long.fromBytesLE(Array.from(integerBytes), false);
  }
  // TODO: Add support for WeakRef.
  if ("$set" in value) {
    let set = new Set();
    for (const element of value.$set) {
      let value = convexReviver(key, element);
      set.add(value);
    }
    return set;
  }
  if ("$map" in value) {
    let map = new Map();
    for (const [k, v] of value.$map) {
      const revivedK = convexReviver(key, k);
      const revivedV = convexReviver(key, v);
      map.set(revivedK, revivedV);
    }
    return map;
  }
  return value;
}

export function parseJSON(text: string): any {
  return JSON.parse(text, convexReviver);
}

export function convexReplacer(key: string, value: any): any {
  if (value instanceof Long) {
    let array = Uint8Array.from(value.toBytesLE());
    return { $integer: Base64.fromByteArray(array) };
  }
  if (value instanceof ArrayBuffer) {
    return { $binary: Base64.fromByteArray(new Uint8Array(value)) };
  }
  if (value instanceof Set) {
    let elements = [];
    for (const element of value) {
      let replacedElement = convexReplacer(key, element);
      elements.push(replacedElement);
    }
    return { $set: elements };
  }
  if (value instanceof Map) {
    let elements = [];
    for (const [k, v] of value) {
      let replacedK = convexReplacer(key, k);
      let replacedV = convexReplacer(key, v);
      elements.push([replacedK, replacedV]);
    }
    return { $map: elements };
  }
  // TODO: Add support for WeakRef.
  return value;
}

export function toJSON(value: any): string {
  return JSON.stringify(value, convexReplacer);
}
