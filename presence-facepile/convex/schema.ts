import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  messages: defineTable({
    author: s.string(),
    body: s.string(),
  }),
  presence: defineTable({
    user: s.string(),
    room: s.string(),
    updated: s.number(),
    data: s.any(),
  })
    .index("by_room_updated", ["room", "updated"])
    .index("by_user_room", ["user", "room"]),
});
