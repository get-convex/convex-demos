import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  channels: defineTable({
    name: s.string(),
  }),
  messages: defineTable({
    body: s.string(),
    channel: s.id("channels"),
    format: s.union(s.literal("text"), s.literal("giphy")),
    user: s.id("users"),
  }),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
