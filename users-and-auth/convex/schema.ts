import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  messages: defineTable({
    body: s.string(),
    user: s.id("users"),
  }),
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
