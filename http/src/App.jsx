import { useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";

export default function App() {
  const messages = useQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText, name);
  }

  const convexDeploymentUrl = import.meta.env.VITE_CONVEX_URL;
  const convexSiteUrl = convexDeploymentUrl.endsWith(".cloud")
    ? convexDeploymentUrl.substring(
        0,
        convexDeploymentUrl.length - ".cloud".length
      ) + ".site"
    : convexDeploymentUrl;
  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>{name}</span>
      </p>
      <div className="instructions">
        <h2>Messages can be sent and read via curl:</h2>
        <h3>Send a message:</h3>
        <p
          style={{ whiteSpace: "break-spaces" }}
        >{`curl -d '{ "author": "User 123", "body": "Hello world" } \\ \n -H 'content-type: application/json' ${convexSiteUrl}/postMessage`}</p>
        <h3>Read messages:</h3>
        <p>{`curl ${convexSiteUrl}/getMessagesByAuthor?authorNumber=123`}</p>
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
