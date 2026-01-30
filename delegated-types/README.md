# Delegated Types: The Recordables Pattern

A Convex demo implementing the **delegated type** pattern from Ruby on Rails, as
pioneered by Basecamp for modeling content across Basecamp and HEY.

The demo models a simplified content management system — projects containing
messages, comments, and documents — where all content shares uniform metadata
and operations while each type retains its own specific attributes.

---

## Part 1: Convex Primer

Convex is a reactive backend platform. You define your database schema and
server functions in TypeScript. Convex handles persistence, real-time
subscriptions, and type safety from database to UI. A few concepts are
essential before we get into the pattern.

### Tables, Documents, and Schemas

Convex stores **documents** (JSON-like objects) in **tables**. You define the
shape of each table in `convex/schema.ts` using validators from `convex/values`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
});
```

Every document automatically gets an `_id` (a globally unique, typed
identifier) and a `_creationTime` (numeric timestamp). You never define these —
they exist on every document.

### References Between Tables

A document can reference another document using `v.id("tableName")`. This is
Convex's typed foreign key:

```typescript
books: defineTable({
  title: v.string(),
  authorId: v.id("authors"),  // typed reference to the authors table
})
```

When you call `ctx.db.get(someId)`, Convex returns the document from the
correct table — the table is encoded in the ID itself.

### Unions and Literal Types

Convex supports union validators. A field can hold one of several types:

```typescript
status: v.union(v.literal("active"), v.literal("archived"), v.literal("trashed"))
```

You can also union across `v.id()` types. A single field can reference
documents from different tables:

```typescript
targetId: v.union(v.id("messages"), v.id("comments"), v.id("documents"))
```

### Indexes

Indexes are declared on tables and enable efficient filtered queries:

```typescript
messages: defineTable({
  channel: v.id("channels"),
  body: v.string(),
}).index("by_channel", ["channel"])
```

Queries use indexes explicitly:

```typescript
const msgs = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channelId))
  .collect();
```

### Queries and Mutations

Server-side logic lives in **query** functions (read-only) and **mutation**
functions (read-write). Both validate their arguments at runtime and infer
TypeScript types from validators:

```typescript
export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    await ctx.db.insert("messages", { body, author });
  },
});
```

Mutations are **transactional** — all reads and writes within a single mutation
either fully succeed or fully roll back. There are no partial failures.

### Reactivity

On the frontend, `useQuery(api.messages.list)` subscribes to the query. When
underlying data changes, the component re-renders automatically. There is no
manual cache invalidation — the system handles it.

---

## Part 2: The Pattern in Rails

### The Problem

Applications often have many content types — messages, comments, documents,
uploads — that share metadata (timestamps, ownership, access control) but
differ in their specific attributes. A message has a subject and body; a
comment has just content; an event has start/end times.

How do you model this without repeating yourself?

### Why Not Single Table Inheritance?

Put everything in one table. Add a `type` column to select the class. Every
column any subtype needs must exist on that table:

```
entries
├── id
├── type          ("Message", "Comment", "Event")
├── subject       (messages only — NULL for others)
├── body          (messages and comments)
├── starts_at     (events only — NULL for others)
├── ends_at       (events only — NULL for others)
└── ...
```

The table grows wider with every new type. Most columns are NULL for most rows.
Adding a type means altering this single, ever-growing table.

### Why Not Polymorphic Associations?

Give each type its own table. Shared concerns use a polymorphic foreign key —
`commentable_id` + `commentable_type` — so a comment can belong to any record:

```
comments
├── commentable_type   ("Message", "Document")
├── commentable_id
├── content
└── ...
```

Now you're working from the bottom up. Querying "all content" across types
requires querying each table and merging results. Pagination across types is
painful. Uniform operations (trash, copy, export) must be implemented per-type.

### The Delegated Type Pattern

Invert the relationship. A single **superclass table** points down to "any kind
of content":

```
recordings (superclass — shared metadata only)
├── id
├── recordable_type    ("Message", "Comment", "Document")
├── recordable_id      (FK to the specific type's table)
├── creator_id
├── created_at
└── updated_at

messages (recordable — type-specific content)    comments       documents
├── id                                           ├── id          ├── id
├── subject                                      └── content     ├── title
└── body                                                         └── body
```

The `recordings` table holds shared metadata plus a type/id pair. Each concrete
type has its own table with only its specific attributes.

In Rails, three parts wire this up:

```ruby
# 1. Superclass declares delegated type
class Recording < ApplicationRecord
  delegated_type :recordable, types: %w[ Message Comment Document ]
end

# 2. Shared module defines reverse association
module Recordable
  extend ActiveSupport::Concern
  included do
    has_one :recording, as: :recordable, touch: true
  end
end

# 3. Each type includes the module
class Message < ApplicationRecord
  include Recordable
end
```

This generates scopes (`Recording.messages`), type checks
(`recording.message?`), accessors (`recording.message`), and more. You query
the single `recordings` table to get any mix of types. You write one controller
for trash/copy/export that works on any recording. Adding a new type means
creating a new table and model — the `recordings` table is never altered.

### The Full Basecamp Extension

Basecamp layers additional patterns on top of the Rails primitive:

- **Buckets**: containers (projects, templates) that hold recordings and
  control access. Recordables know nothing about access — that's the bucket's
  job.
- **Tree structure**: recordings form parent-child hierarchies. A message
  board's children are messages; a message's children are comments. Navigation
  always goes through recordings.
- **Immutable recordables**: editing creates a new recordable and updates the
  recording's pointer. The old version still exists.
- **Event history**: an events table logs which recordable a recording pointed
  to at each moment, enabling version history and change logs.
- **Capabilities**: each type declares what it supports (commentable,
  subscribable, exportable) via boolean methods. Generic controllers check
  these before acting.

---

## Part 3: From Rails to Convex

The delegated type pattern maps naturally to Convex. The core data structure —
a lightweight superclass table referencing separate type-specific tables — is
directly expressible with Convex's schema, typed IDs, and unions. The
differences are in how the two platforms express behavior and relationships.

### Structural Mapping

| Rails Concept | Convex Equivalent |
|---|---|
| `recordings` SQL table | `recordings` Convex table |
| `recordable_type` column (string) | `type` field with `v.union(v.literal("message"), ...)` |
| `recordable_id` column (integer FK) | `recordableId` field with `v.union(v.id("messages"), ...)` |
| `messages` SQL table | `messages` Convex table |
| `belongs_to :bucket` | `projectId: v.id("projects")` |
| `parent_id` (self-referential FK) | `parentId: v.optional(v.id("recordings"))` |
| `creator_id` FK | `creatorId: v.id("users")` |
| `created_at` / `updated_at` | `_creationTime` (automatic) + `updatedAt` field if needed |

### Behavior Mapping

| Rails Concept | Convex Equivalent |
|---|---|
| `delegated_type :recordable, types: [...]` | Schema definition with `v.union()` of `v.literal()` types |
| `Recording.messages` (scope) | Indexed query: `.withIndex("by_type", q => q.eq("type", "message"))` |
| `recording.message?` (type check) | `recording.type === "message"` (TypeScript narrowing) |
| `recording.recordable` (fetch delegate) | `ctx.db.get(recording.recordableId)` (ID encodes the table) |
| `recording.message` (typed fetch) | Helper function with type guard + `ctx.db.get()` |
| `delegates :title, to: :recordable` | Helper function that dispatches based on `recording.type` |
| `Recordable` concern (shared module) | TypeScript helper functions and shared type definitions |
| `def commentable? = true` (capability) | Capability map: `{ message: { commentable: true, ... }, ... }` |
| ActiveRecord callbacks | Logic in mutation handlers (explicit, not implicit) |
| Controller actions | Convex query and mutation functions |
| Russian doll caching | Convex reactive queries (automatic, no manual invalidation) |

### What Changes, What Stays the Same

**Stays the same:**
- The core data architecture — one metadata table, separate content tables,
  type/id reference pair.
- The principle that recordings are the unit of organization and querying.
- The principle that recordables are dumb content with no external references.
- The tree structure via self-referential parent IDs.
- The benefit of uniform operations across types.

**Changes:**
- **No ORM magic.** Rails' `delegated_type` generates methods, scopes, and
  associations through metaprogramming. In Convex, you express the same
  relationships explicitly through schema validators and helper functions.
  This is more verbose but completely transparent — there's no hidden behavior.
- **TypeScript replaces Ruby conventions.** Rails relies on naming conventions
  (`recordable_type` maps to class names). Convex uses TypeScript's type system
  — `v.literal("message")` is checked at compile time and validated at runtime.
- **Transactions are built in.** In Rails, creating a recording and its
  recordable together requires care (callbacks, service objects, or
  `accepts_nested_attributes_for`). In Convex, a mutation is automatically
  atomic — insert the recordable, insert the recording, and both either succeed
  or neither does.
- **Reactivity replaces caching.** Rails uses cache keys and Russian doll
  caching to avoid re-rendering. Convex queries are reactive subscriptions —
  when data changes, subscribed components re-render with fresh data. There is
  no cache to invalidate.
- **Joins are explicit.** Rails loads associations lazily or eagerly
  (`includes`, `preload`). In Convex, you follow references with
  `ctx.db.get(id)` explicitly in your query handler. This makes the data
  access pattern visible rather than hidden behind association proxies.

---

## Part 4: Implementation Architecture

### Schema Design

The schema has six tables organized in two groups:

**Superclass and containers:**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The set of recordable type names — defined once, used everywhere.
const recordableType = v.union(
  v.literal("message"),
  v.literal("comment"),
  v.literal("document"),
);

// All possible recordable IDs — one per type table.
const recordableId = v.union(
  v.id("messages"),
  v.id("comments"),
  v.id("documents"),
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),

  projects: defineTable({
    name: v.string(),
  }),

  recordings: defineTable({
    type: recordableType,
    recordableId: recordableId,
    projectId: v.id("projects"),
    creatorId: v.id("users"),
    parentId: v.optional(v.id("recordings")),
  })
    .index("by_project_and_type", ["projectId", "type"])
    .index("by_parent", ["parentId"]),
```

**Recordable tables (type-specific content):**

```typescript
  messages: defineTable({
    subject: v.string(),
    body: v.string(),
  }),

  comments: defineTable({
    content: v.string(),
  }),

  documents: defineTable({
    title: v.string(),
    body: v.string(),
  }),
});
```

### Design Principles

**1. The recordings table is the spine.**

Every query starts with recordings. Want all content in a project? Query
`recordings` by `projectId`. Want only messages? Add a type filter. Want a
specific item and all its children? Look up the recording, then query by
`parentId`. The recordable tables are never queried directly — they're
reached by following `recordableId` from a recording.

**2. Recordables are inert.**

A recordable has no foreign keys, no timestamps, no references to recordings
or projects or users. It is purely a bag of content-specific fields. This is
what makes copying a recording cheap (point a new recording at the same
recordable) and what keeps the content tables small and independent.

**3. Type safety at the schema boundary.**

The `type` field uses `v.union(v.literal(...))` — Convex validates it at
runtime and TypeScript checks it at compile time. The `recordableId` field
uses `v.union(v.id(...))` — each variant is typed to a specific table. The
pairing of type + recordableId is enforced by mutation logic: you never set
them independently.

**4. Mutations are the consistency boundary.**

Creating a recording means inserting a recordable and a recording in the same
mutation. Because Convex mutations are transactional, there is no window where
a recording exists without its recordable, or vice versa. This replaces Rails'
reliance on callbacks and `dependent: :destroy`.

**5. Explicit data access.**

There is no lazy loading or association proxy. When a query handler needs the
recordable content, it calls `ctx.db.get(recording.recordableId)`. When it
needs the parent recording, it calls `ctx.db.get(recording.parentId)`. Every
database read is visible in the code.

### Key Design Decision: Flat Fields vs. Document-Level Union

There are two ways to represent the type/id pair in Convex's schema.

**This demo uses flat fields** — `type` and `recordableId` as separate
top-level fields:

```typescript
recordings: defineTable({
  type: v.union(v.literal("message"), v.literal("comment"), ...),
  recordableId: v.union(v.id("messages"), v.id("comments"), ...),
  projectId: v.id("projects"),
  // ...
})
```

The alternative is a **document-level discriminated union**, where the entire
document is a union of objects:

```typescript
recordings: defineTable(
  v.union(
    v.object({
      type: v.literal("message"),
      recordableId: v.id("messages"),
      projectId: v.id("projects"),
      creatorId: v.id("users"),
      parentId: v.optional(v.id("recordings")),
    }),
    v.object({
      type: v.literal("comment"),
      recordableId: v.id("comments"),
      // ... same shared fields repeated for each variant
    }),
    // ...
  )
)
```

The document-level union gives **full TypeScript narrowing**: after checking
`recording.type === "message"`, TypeScript knows `recordableId` is
`Id<"messages">`. The flat approach doesn't — TypeScript sees `recordableId`
as the full union regardless of the `type` check.

We chose flat fields because:
- The schema is shorter and easier to read.
- Shared fields aren't repeated for each variant (the core point of the pattern
  is that metadata is shared, not duplicated).
- Indexing works straightforwardly on flat fields.
- The type/id consistency is enforced by mutations, which always set them
  together — the same way Rails enforces it (no database constraint ties
  `recordable_type` to `recordable_id` in Rails either).
- A small helper function bridges the narrowing gap where needed.

### Function Organization

Functions are grouped by what they operate on:

| File | Responsibility |
|---|---|
| `convex/recordings.ts` | All recording operations — create, list, get (with recordable), get children, trash/restore. This is the main API surface; everything goes through recordings. |
| `convex/projects.ts` | Project CRUD. Projects are the "buckets" — containers that hold recordings. |
| `convex/users.ts` | User lookup. Minimal — just enough to populate `creatorId`. |
| `convex/schema.ts` | Schema definition and shared validator constants. |

There are no `messages.ts`, `comments.ts`, or `documents.ts` function files.
This is intentional — recordables are not accessed directly. They are always
reached through recordings. If a recordable type needed special behavior on
creation, that logic would live in `recordings.ts` as a branch within the
create mutation, keeping the single entry point.

### Query Patterns

**List recordings in a project, optionally filtered by type:**

```typescript
export const list = query({
  args: {
    projectId: v.id("projects"),
    type: v.optional(recordableType),
  },
  handler: async (ctx, { projectId, type }) => {
    let q = ctx.db
      .query("recordings")
      .withIndex("by_project_and_type", (q) =>
        type
          ? q.eq("projectId", projectId).eq("type", type)
          : q.eq("projectId", projectId)
      );
    const recordings = await q.collect();

    // Fetch each recording's recordable content
    return Promise.all(
      recordings.map(async (recording) => ({
        ...recording,
        recordable: await ctx.db.get(recording.recordableId),
      }))
    );
  },
});
```

This is the Convex equivalent of `bucket.recordings.messages` — a single
indexed query on the `recordings` table, then a fan-out to fetch each
recordable. The fan-out is explicit (no hidden N+1 — it's deliberate and
visible).

**Get children of a recording:**

```typescript
export const children = query({
  args: { recordingId: v.id("recordings") },
  handler: async (ctx, { recordingId }) => {
    const kids = await ctx.db
      .query("recordings")
      .withIndex("by_parent", (q) => q.eq("parentId", recordingId))
      .collect();
    return Promise.all(
      kids.map(async (r) => ({
        ...r,
        recordable: await ctx.db.get(r.recordableId),
      }))
    );
  },
});
```

Tree traversal goes through the `recordings` table, never through recordable
tables directly.

### Mutation Patterns

**Create a recording with its recordable:**

```typescript
export const create = mutation({
  args: {
    type: recordableType,
    content: v.union(
      v.object({ subject: v.string(), body: v.string() }),     // message
      v.object({ content: v.string() }),                        // comment
      v.object({ title: v.string(), body: v.string() }),        // document
    ),
    projectId: v.id("projects"),
    creatorId: v.id("users"),
    parentId: v.optional(v.id("recordings")),
  },
  handler: async (ctx, { type, content, projectId, creatorId, parentId }) => {
    // Insert the recordable into its type-specific table
    const recordableId = await ctx.db.insert(type + "s", content);

    // Insert the recording that references it
    return ctx.db.insert("recordings", {
      type,
      recordableId,
      projectId,
      creatorId,
      parentId,
    });
  },
});
```

Both inserts happen in the same mutation — transactionally atomic. The
recordable is created first (to get its ID), then the recording is created
with the reference. This is the Convex equivalent of
`Recording.create!(recordable: Message.new(...))`.

**Copy a recording (the cheap copy pattern):**

```typescript
export const copy = mutation({
  args: {
    recordingId: v.id("recordings"),
    destinationProjectId: v.id("projects"),
    destinationParentId: v.optional(v.id("recordings")),
  },
  handler: async (ctx, { recordingId, destinationProjectId, destinationParentId }) => {
    const source = await ctx.db.get(recordingId);

    // Create a new recording pointing to the SAME recordable — no content duplication
    return ctx.db.insert("recordings", {
      type: source.type,
      recordableId: source.recordableId,
      projectId: destinationProjectId,
      creatorId: source.creatorId,
      parentId: destinationParentId,
    });
  },
});
```

This is the key efficiency: copying creates one new row in `recordings` and
zero new rows in any content table. The recordable is shared by reference.

### What This Demo Includes vs. Omits

**Included** (core delegated type pattern):
- Superclass table with type/id delegation to separate content tables
- Projects as containers (the "bucket" concept)
- Tree structure (parent/child recordings)
- Uniform operations through recordings (create, list, copy)
- Cross-type querying with a single indexed query
- Type-safe schema with Convex validators

**Omitted** (Basecamp extensions — interesting but not essential to the
pattern):
- Immutable recordables and version history (would add an `events` table
  tracking recordable pointer changes over time)
- Capability declaration (would add a config map: `{ message: { commentable:
  true } }`)
- Trash/archive lifecycle (would add a `status` field to recordings)
- Full-text search across recordings (would add a `searchIndex` to recordings
  with a denormalized title field)

These extensions compose well with the base pattern and could be layered on
incrementally.
