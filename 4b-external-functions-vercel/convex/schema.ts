import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  channels: defineTable({
    name: s.string(),
  }),
  messages: defineTable({
    body: s.string(),
    channel: s.id("channels"),
    format: s.string(), // "text" or "giphy"
    user: s.id("users"),
  }),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }),
});
