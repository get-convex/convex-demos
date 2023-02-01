import { useRef, useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";

export default function App() {
  const messages = useQuery("listMessages") || [];
  const sendMessage = useMutation("sendMessage");
  const [newMessageText, setNewMessageText] = useState("");
  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  const messagesList = useRef();

  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText, name);
  }

  return (
      <main>
        <header>
          <h1>Convex Chat</h1>
          <span>{name}</span>
        </header>
        <ul ref={messagesList}>
          {messages.map(message => (
            <li key={message._id.toString()} className={message.author === name ? 'sent' : 'received'}>
              <p>{message.body}</p>
              <span>{message.author}{message.author === name && " (You)"} &bull; {new Date(message._creationTime).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessageText}
            onChange={event => setNewMessageText(event.target.value)}
            placeholder="Write a message…"
          />
          <button type="submit" disabled={!newMessageText}>Send</button>
        </form>
      </main>
  );
}
