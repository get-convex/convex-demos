/**
 * React helpers for adding session data to Convex functions.
 *
 * !Important!: To use these functions, you must wrap your code with
 * ```tsx
 *  <ConvexProvider client={convex}>
 *    <SessionProvider storageLocation={"sessionStorage"}>
 *      <App />
 *    </SessionProvider>
 *  </ConvexProvider>
 * ```
 *
 * With the `SessionProvider` inside the `ConvexProvider` but outside your app.
 */
import React, { useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const StoreKey = "ConvexSessionId";

const SessionContext = React.createContext(null);

/**
 * Context for a Convex session, creating a server session and providing the id.
 *
 * @param props - Where you want your session ID to be persisted. Roughly:
 *  - sessionStorage is saved per-tab
 *  - localStorage is shared between tabs, but not browser profiles.
 * @returns A provider to wrap your React nodes which provides the session ID.
 * To be used with useSessionQuery and useSessionMutation.
 */
export const SessionProvider = ({ storageLocation, children }) => {
  const store =
    // If it's rendering in SSR or such.
    typeof window === "undefined"
      ? null
      : window[storageLocation ?? "sessionStorage"];
  const [sessionId, setSession] = useState(() => {
    const stored = store?.getItem(StoreKey);
    if (stored) {
      return stored;
    }
    return null;
  });
  const createSession = useMutation(api.lib.withSession.create);

  // Get or set the ID from our desired storage location, whenever it changes.
  useEffect(() => {
    if (sessionId) {
      store?.setItem(StoreKey, sessionId);
    } else {
      void (async () => {
        setSession(await createSession());
      })();
    }
  }, [sessionId, createSession, store]);

  return React.createElement(
    SessionContext.Provider,
    { value: sessionId },
    children
  );
};

// Like useQuery, but for a Query that takes a session ID.
export const useSessionQuery = (functionReference, args) => {
  const sessionId = useContext(SessionContext);
  const newArgs = { ...args, sessionId };
  return useQuery(name, newArgs);
};

// Like useMutation, but for a Mutation that takes a session ID.
export const useSessionMutation = (functionReference) => {
  const sessionId = useContext(SessionContext);
  const originalMutation = useMutation(functionReference);
  return (args) => {
    const newArgs = { ...args, sessionId };
    return originalMutation(newArgs);
  };
};
