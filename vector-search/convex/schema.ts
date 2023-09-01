import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  foods: defineTable({
    description: v.string(),
    cuisine: v.string(),
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["cuisine"],
  }),
  movieEmbeddings: defineTable({
    embedding: v.array(v.float64()),
    genre: v.string(),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["genre"],
  }),
  movies: defineTable({
    title: v.string(),
    genre: v.string(),
    description: v.string(),
    votes: v.number(),
    embeddingId: v.optional(v.id("movieEmbeddings")),
  }).index("by_embedding", ["embeddingId"]),
});
