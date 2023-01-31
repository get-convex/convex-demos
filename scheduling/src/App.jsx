import { useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";

export default function App() {
  const messages = useQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");
  const ping = useMutation("ping");

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    if (newMessageText.startsWith("/ping")) {
      const count = parseInt(newMessageText.slice(5));
      if (!isFinite(count) || count < 0) {
        alert("Invalid ping count!");
        return;
      }
      await ping(name, count);
    } else {
      await sendMessage(newMessageText, name);
    }
  }
  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>{name}</span>
      </p>
      <div className="instructions">
        To send a ping, use <span>/ping count</span>
      </div>
      <ul>
        {messages.map(message => (
          <li key={message._id.toString()}>
            <span>{message.author}:</span>
            <span>{message.body}</span>
            <span>{new Date(message._creationTime).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          value={newMessageText}
          onChange={event => setNewMessageText(event.target.value)}
          placeholder="Write a message…"
        />
        <input type="submit" value="Send" disabled={!newMessageText} />
      </form>
    </main>
  );
}
