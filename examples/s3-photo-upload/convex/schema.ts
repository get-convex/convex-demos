import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  messages: defineTable({
    author: s.string(),
    body: s.string(),
    format: s.union(s.literal("text"), s.literal("s3")),
  }),
});
