import { useEffect, useState } from "react";
import { ConvexClient } from "convex-sdk";

const convex = new ConvexClient("http://localhost:8000");

function Counter() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    return convex.query("getCounter").watch({}, setCounter);
  }, []);

  function incrementCounter(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
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
