import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  channels: defineTable({
    name: s.string(),
  }),
  messages: defineTable({
    body: s.string(),
    channel: s.id("channels"),
    user: s.id("users"),
  }),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }),
});
