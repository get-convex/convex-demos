# Delegated Types: The Recordables Pattern

This demo implements the **delegated type** pattern from Ruby on Rails, as
pioneered by Basecamp for modeling content in their products. This README
describes the pattern as it exists in Rails before any mapping to Convex.

## The Problem

Applications often have many content types (messages, comments, documents,
uploads) that are conceptually similar — they share metadata like timestamps,
ownership, and access control — but differ in their specific attributes. A
message has a subject and body; a comment has just content; an event has
start/end times. How do you model this without repeating yourself?

Rails offers three approaches. Delegated types is the third, and the one this
demo is based on.

## Approach 1: Single Table Inheritance (STI)

Put everything in one table with a `type` column that selects the Ruby class.
All subtypes share the same table, so every column any subtype needs must exist
on that table.

```
entries
├── id
├── type          ("Message", "Comment", "Event")
├── subject       (messages only — NULL for others)
├── body          (messages and comments)
├── content       (comments only — NULL for others)
├── starts_at     (events only — NULL for others)
├── ends_at       (events only — NULL for others)
├── created_at
└── updated_at
```

**Downside**: The table grows wider with every new type. Most columns are NULL
for most rows. The table becomes large on disk and slow to migrate. Adding a
new type means altering this single, ever-growing table.

## Approach 2: Polymorphic Associations

Give each type its own table. Shared concerns (like comments) use a polymorphic
foreign key — `commentable_id` + `commentable_type` — so a comment can belong
to any kind of record.

```
comments
├── id
├── commentable_type   ("Message", "Document", "Upload")
├── commentable_id
├── content
└── created_at
```

**Downside**: You're working from the bottom up. Querying "all content" across
types is hard — you'd need to query each table separately and merge results.
Pagination across types is painful. Operations that should apply uniformly
(trash, copy, export) must be implemented per-type.

## Approach 3: Delegated Types

Invert the polymorphic relationship. Instead of each child pointing up to "any
kind of parent," have a single **superclass table** that points down to "any
kind of content."

### The Database Schema

```
recordings (the superclass table)
├── id
├── recordable_type    ("Message", "Comment", "Document")
├── recordable_id      (foreign key to the specific type's table)
├── creator_id
├── created_at
└── updated_at

messages (a recordable)
├── id
├── subject
└── body

comments (a recordable)
├── id
└── content

documents (a recordable)
├── id
├── title
└── body
```

The `recordings` table holds **shared metadata** — timestamps, ownership,
access references — plus a type/id pair pointing to the concrete record. Each
concrete type has **its own lean table** with only its specific attributes.

### The Rails Declaration

Three parts wire this up:

**1. The superclass declares its delegated type:**

```ruby
class Recording < ApplicationRecord
  delegated_type :recordable, types: %w[ Message Comment Document ]
end
```

**2. A shared module defines the reverse association:**

```ruby
module Recordable
  extend ActiveSupport::Concern

  included do
    has_one :recording, as: :recordable, touch: true
  end
end
```

**3. Each concrete type includes the module:**

```ruby
class Message < ApplicationRecord
  include Recordable
end

class Comment < ApplicationRecord
  include Recordable
end
```

### What Rails Generates

The `delegated_type` declaration creates several conveniences on `Recording`:

| Method | Purpose |
|---|---|
| `recording.recordable` | Returns the concrete record (Message, Comment, etc.) |
| `recording.message?` | Returns true if the recordable is a Message |
| `recording.message` | Returns the Message or nil |
| `recording.message_id` | Returns the Message id or nil |
| `Recording.messages` | Scope: only recordings whose recordable is a Message |
| `Recording.comments` | Scope: only recordings whose recordable is a Comment |
| `recording.recordable_class` | Returns the concrete class (e.g. `Message`) |
| `recording.recordable_name` | Returns the type name as a lowercase string |

### Creating Records

```ruby
Recording.create!(
  recordable: Message.new(subject: "Hello", body: "World"),
  creator: current_user
)
```

Both the Recording row and the Message row are persisted together.

### Delegating Methods

The superclass can delegate behavior to its concrete type, so callers don't
need to know or care what type they're working with:

```ruby
class Recording < ApplicationRecord
  delegated_type :recordable, types: %w[ Message Comment Document ]
  delegates :title, to: :recordable
end

class Message < ApplicationRecord
  include Recordable
  def title = subject
end

class Comment < ApplicationRecord
  include Recordable
  def title = content.truncate(20)
end
```

Now `recording.title` works regardless of the underlying type.

## Why This Matters: The Practical Benefits

The benefits are clearest at scale. Basecamp has used this pattern for 10+
years across multiple product versions.

### 1. Uniform Querying and Pagination

Because all content lives (by reference) in one table, you can query, filter,
and paginate across types in a single query:

```ruby
Recording.messages                          # all message recordings
Recording.where(created_at: 1.week.ago..)  # everything from last week
bucket.recordings.messages                  # messages in a specific project
```

Building a timeline or activity feed of mixed content types is just a query on
`recordings` — no multi-table UNION, no application-level merging.

### 2. Uniform Operations

Operations that should work the same for all content — trash, archive, copy,
move, export, cache — are written once against `Recording`. They don't need to
know about specific types:

```ruby
# A single controller handles trashing any kind of content
class RecordingsController < ApplicationController
  def trash
    @recording.trash
  end
end
```

Adding a new type doesn't require changes to any of these generic operations.

### 3. Cheap Type Addition

Adding a new content type means:
1. Create a new table (e.g., `hill_charts`) with type-specific columns.
2. Create a new model that includes `Recordable`.
3. Add the type name to the `types` array in the `delegated_type` declaration.

The `recordings` table is never altered. No migration of the main table. No
changes to existing controllers, copiers, exporters, or views.

### 4. Lightweight Superclass Table

The `recordings` table has no text columns — just integer foreign keys and
timestamps. It stays small on disk even with billions of rows, making it fast
to query and index. The heavy content (document bodies, message text) lives in
the individual type tables.

### 5. Efficient Copying

Copying a recording doesn't require duplicating its content. You create a new
`recordings` row pointing to the **same** recordable. If a message is copied
100 times, there's still only one row in the `messages` table. This is possible
because the recordable is a separate, referenced record.

## The Full Basecamp Pattern

Basecamp extends the basic Rails `delegated_type` with several additional
patterns that work together. These aren't part of the Rails primitive but show
how it composes with other ideas.

### Buckets (Access Control Containers)

A **bucket** is a container for recordings that controls access. Buckets
themselves use delegated types — a bucket delegates to a "bucketable," which
might be a Project, a Template, or a Ping. If you have access to a bucket, you
can see all recordings within it. Recordables know nothing about access
control; that's the bucket's job.

### Tree Structure

Recordings form a **parent-child tree**. A message board recording's children
are message recordings. A message recording's children are comment recordings.
Navigation always goes through recordings:

```
Bucket (Project)
└── Recording (Message Board)
    ├── Recording (Message)
    │   ├── Recording (Comment)
    │   └── Recording (Comment)
    └── Recording (Message)
```

Parents and children are always recordings — you never traverse directly
between recordables.

### Immutable Recordables

Recordables are **never modified in place**. Editing a document creates a new
document recordable and updates the recording to point to it. The old version
still exists.

### Event History

An **events** table tracks which recordable a recording pointed to at each
moment in time. Combined with immutable recordables, this gives you full
version history and change logs: each event references a specific recordable
snapshot. "Reverting" to an old version just means updating the recording's
pointer.

### Capability Declaration

Each recordable type declares what it can do through simple boolean methods:

```ruby
class Document < ApplicationRecord
  include Recordable

  def subscribable? = true
  def commentable? = true
  def exportable? = true
  def copyable? = true
end

class MessageBoard < ApplicationRecord
  include Recordable

  def commentable? = false  # can't comment directly on a board
end
```

Generic controllers check these capabilities before acting. The `Recordable`
module provides safe defaults (usually `false`), and each type opts in to what
it supports.

## Summary

| Aspect | STI | Polymorphic | Delegated Type |
|---|---|---|---|
| Tables | One wide table for all types | Separate tables; child points to any parent | One metadata table + separate type tables |
| Adding types | Alter the shared table | Add a new table, update each polymorphic host | Add a new table, register the type name |
| Cross-type queries | Easy (one table) | Hard (query each table) | Easy (query the superclass table) |
| Table size on disk | Large (all columns, all content) | Small per table | Superclass is tiny; type tables vary |
| Direction | Subclass inherits from table | Child belongs to any parent | Parent delegates to any type |
