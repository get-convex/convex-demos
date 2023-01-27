import { useState } from "react";
import { useAction, useMutation, useQuery } from "../convex/_generated/react";

export default function App() {
  const messages = useQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");
  const sendDallE = useAction("actions/sendDallE");

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    if (
      newMessageText.startsWith("/dalle ") ||
      newMessageText.startsWith("/dall-e ")
    ) {
      const prompt = newMessageText.split(" ").slice(1).join(" ");
      await sendDallE(prompt, name);
    } else {
      await sendMessage(newMessageText, name, "text");
    }
  }
  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>{name}</span>
      </p>
      <div className="instructions">
        To send a Dall-E image, use <span>/dall-e prompt</span>
      </div>
      <ul>
        {messages.map(message => (
          <li key={message._id.toString()}>
            <span>{message.author}:</span>
            {message.format === "dall-e" ? (
              <span>
                <img src={message.body} />
                <div className="dall-e-attribution">
                  Powered by Dall-E (OpenAI)
                </div>
              </span>
            ) : (
              <span>{message.body}</span>
            )}
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
