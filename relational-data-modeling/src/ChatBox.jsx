import { useState } from "react";
import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export default function ChatBox({ channelId, name }) {
  const messages = useQuery(api.listMessages.default, { channelId }) || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation(api.sendMessage.default);

  async function handleSendMessage(event) {
    event.preventDefault();
    await sendMessage({
      channel: channelId,
      body: newMessageText,
      author: name,
    });
    setNewMessageText("");
  }
  return (
    <div className="chat-box">
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
    </div>
  );
}
