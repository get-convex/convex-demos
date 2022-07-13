/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex-dev@0.1.4.
 * To regenerate, run `npx convex codegen`.
 * @module
 */

import { SchemaDefinition, TableDefinition } from "convex-dev/schema";
import schema from "../schema";

type Schema = typeof schema extends SchemaDefinition<infer Schema>
  ? Schema
  : never;

/**
 * The names of all of your Convex tables.
 */
export type TableNames = keyof Schema;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Document<TableName extends TableNames> =
  Schema[TableName] extends TableDefinition<infer DocumentType, any>
    ? DocumentType
    : never;

type Indexes<TableName extends TableNames> =
  Schema[TableName] extends TableDefinition<any, any, infer IndexType>
    ? IndexType
    : never;

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */
export type DataModel = {
  [TableName in TableNames]: {
    document: Document<TableName>;
    indexes: Indexes<TableName>;
  };
};
