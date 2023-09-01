# Vector Search Example App

This example demonstrates how to use
[Convex vector search](https://docs.convex.dev/vector-search).

It has a "Food search" and "Movie search". The "Food search" shows the simplest
way to set up a vector search, and matches the Convex
[documentation](https://docs.convex.dev/vector-search).

The "Movies search" shows some alternative pattens documented
[here](https://docs.convex.dev/vector-search#advanced-patterns).

## Running the App

This app uses OpenAI to generate embeddings. Set the `OPENAI_KEY` environment
variable to your OpenAI API key in the convex dashboard.

Run:

```
npm install
npm run dev
```
