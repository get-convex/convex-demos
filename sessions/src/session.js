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
import { Id } from "../convex/_generated/dataModel";
import { useQuery, useMutation } from "../convex/_generated/react";

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
  const store = window[storageLocation ?? "sessionStorage"];
  const [sessionId, setSession] = useState(() => {
    // If it's rendering in SSR or such.
    if (typeof window === "undefined") {
      return null;
    }
    const stored = store.getItem(StoreKey);
    if (stored) {
      return new Id("sessions", stored);
    }
    return null;
  });
  const createSession = useMutation("lib/withSession:create");

  // Get or set the ID from our desired storage location, whenever it changes.
  useEffect(() => {
    if (sessionId) {
      store.setItem(StoreKey, sessionId.id);
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
export const useSessionQuery = (name, ...args) => {
  const sessionId = useContext(SessionContext);
  return useQuery(name, sessionId, ...args);
};

// Like useMutation, but for a Mutation that takes a session ID.
export const useSessionMutation = name => {
  const sessionId = useContext(SessionContext);
  const originalMutation = useMutation(name);
  return (...args) => {
    return originalMutation(sessionId, ...args);
  };
};
