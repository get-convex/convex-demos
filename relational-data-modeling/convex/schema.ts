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
