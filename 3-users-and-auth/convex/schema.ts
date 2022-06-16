import { defineSchema, defineTable, s } from "convex-dev/schema";

export default defineSchema({
  channels: defineTable({
    name: s.string(),
  }),
  messages: defineTable({
    channel: s.id(),
    body: s.string(),
    time: s.number(),
    user: s.id(),
  }),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }),
});
