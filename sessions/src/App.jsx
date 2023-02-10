import { useState } from "react";
import { useSessionMutation, useSessionQuery } from "./session";

export default function App() {
  const name = useSessionQuery("name:get");
  const updateName = useSessionMutation("name:set");
  const messages = useSessionQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useSessionMutation("sendMessage");

  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText);
  }
  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>
          <input
            name="name"
            value={name ?? ""}
            type="text"
            onChange={e => updateName(e.target.value)}
            placeholder="Type Name"
          />
        </span>
      </p>
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
