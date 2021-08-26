import { useEffect, useState } from "react";
import { ConvexClient } from "convex-sdk";

const convex = new ConvexClient("http://localhost:8000");

function Counter() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Watch the results of the Convex function `getCounter` and call
    // `setCounter` on the return value.
    return convex.query("getCounter").watch({}, setCounter);
  }, []);

  function incrementCounter(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    // Execute the Convex function `updateCounter` as a transaction that updates
    // the counter value.
    convex.transaction("updateCounter").call();
  }

  return (
    <div>
      <div>{counter}</div>
      <button onClick={incrementCounter}>Add One!</button>
    </div>
  );
}

function App() {
  return (
    <main>
      Here's the counter: <Counter />
    </main>
  );
}
export default App;
