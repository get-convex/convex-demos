# Sessions Example App

This example demonstrates using a pattern to keep track of user sessions in a
database table to track per-tab or per-browser data, even without being logged
in.

It leverages some helpful wrappers in [sessions.js](./convex/sessions.js) to
wrap Convex [functions](https://docs.convex.dev/using/writing-convex-functions)
and [sessionsClient.js](./src/sessionsClient.js) to wrap the `useQuery` and
`useMutation` hooks in React.

More detail can be found in the
[Stack post](https://stack.convex/dev/sessions-wrappers-as-middleware).

## Using sessions yourself:

1. In addition to a `ConvexProvider`, wrap your app with a `SessionProvider`:
   ```
   <ConvexProvider client={convex}>
     <SessionProvider storageLocation={"sessionStorage"}>
       <App />
     </SessionProvider>
   </ConvexProvider>
   ```
2. Use `queryWithSession` or `mutationWithSession` as your function:
   ```
   export default queryWithSession(async ({ db, session }, yourArg) => {
       ...
   });
   ```
3. Use `useSessionQuery` or `useSessionQuery` in your React client:
   ```
   const messages = useSessionQuery('listMessages');
   ...
   ```
4. [Optional] Write any data that you want to be available in subsequent session
   requests to the `sessions` table :
   ```
   db.patch(session._id, {new: data});
   ```
5. [Optional] Update the [sessions:create](./convex/sessions.js) function to
   initialize the session data. In this example, we initialize a random user
   name.

## Running the App

Run:

```
npm install
npm run dev
```
