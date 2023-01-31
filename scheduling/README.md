# Scheduling Example App

This app provides a basic example of how to use Convex scheduling. It allows the
user to type a chat message like `/ping 5`, that sends 5 `ping` and `pong`
times.

The app defines a mutation that inserts a "ping" message and schedules a another
mutation to be executed a second later. The latter mutation inserts a "pong"
message and conditionally calls the first mutation again.

The example builds on the Convex
[tutorial](https://github.com/get-convex/convex/tree/main/npm-packages/demos/tutorial).

## Running the App

Run:

```
npm install
npm run dev
```
