import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const messages = useQuery(api.listMessages.default) || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation(api.sendMessage.default);
  const sendGif = useAction(api.sendGif.default);
  const sendRandomGif = useAction(api.sendRandomGif.default)

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    // If a /giphy command is entered, call the action.
    if (newMessageText.startsWith("/giphy ")) {
      const query = newMessageText.slice(7);
      await sendGif({ queryString: query, author: name });
    }
    else if (newMessageText.startsWith("/random")) {
      await sendRandomGif({ author: name });    
    }
    else {
      await sendMessage({ body: newMessageText, author: name });
    }
    setNewMessageText("");
  }
  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>{name}</span>
      </p>
      <div className="instructions">
        To send a GIF, use <span>/giphy message</span>
      </div>
      <ul>
        {messages.map(message => (
          <li key={message._id.toString()}>
            <span>{message.author}:</span>
            {message.format === "giphy" ? (
              <span>
                <iframe src={message.body} />
                <div className="giphy-attribution">Powered By GIPHY</div>
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
