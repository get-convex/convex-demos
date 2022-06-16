import { useQuery, useMutation } from "../convex/_generated/react";

export default function App() {
  // Watch the results of the Convex function `getCounter`.
  const counter = useQuery("getCounter") ?? 0;

  const increment = useMutation("incrementCounter");
  function incrementCounter() {
    // Execute the Convex function `incrementCounter` as a mutation
    // that updates the counter value.
    return increment(1);
  }

  return (
    <main>
      <div>Here's the counter:</div>
      <div>{counter}</div>
      <button onClick={incrementCounter}>Add One!</button>
    </main>
  );
}
