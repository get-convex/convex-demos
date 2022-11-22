# Relational Data Modeling Example App

This example demonstrates how to use Convex to create a relational data model.

It's a multi-channel message app. It has two tables: `channels` and `messages`.

Every message is associated with one channel. We create that association by
embedding a channel ID in every message.

Here is the resulting schema:

```typescript
import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  channels: defineTable({
    name: s.string(),
  }),
  messages: defineTable({
    author: s.string(),
    body: s.string(),
    channel: s.id("channels"),
  }),
});
```

You can see how this schema is used by inspecting the Convex functions in the
`convex/` directory.

## Running the App

Run:

```
npm install
npx convex dev
```

In a separate terminal:

```
npm run dev
```

Then visit [localhost:3000](http://localhost:3000).
