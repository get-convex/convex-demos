import { useState, FormEvent } from "react";
import { ConvexClient, useQuery } from "@convex-dev/react";

// Initialize Convex Client and connect to server in convex.json.
import convexConfig from "../convex.json";

const convex = new ConvexClient(convexConfig.origin);
const randomName = "User " + Math.floor(Math.random() * 10000);

export default function App() {
  // Dynamically update `channels` in response to the output of
  // `listChannels.ts`.
  const channels = useQuery(convex.query("listChannels")) || [];

  // Records the Convex document ID for the currently selected channel.
  const [channelId, setChannelId] = useState(null);

  // Run `addChannel.ts` as a transaction to create a new channel when
  // `handleAddChannel` is triggered.
  const [newChannelName, setNewChannelName] = useState("");

  async function handleAddChannel(event: FormEvent) {
    event.preventDefault();
    if (newChannelName) {
      setNewChannelName("");
      let channel = await convex.transaction("addChannel").call(newChannelName);
      setChannelId(channel._id);
    }
  }

  // Dynamically update `messages` in response to the output of
  // `listMessages.ts`.
  const messages = useQuery(convex.query("listMessages"), channelId) || [];

  // Run `sendMessage.ts` as a transaction to record a chat message when
  // `handleSendMessage` triggered.
  const [newMessageText, setNewMessageText] = useState("");
  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    if (newMessageText) {
      setNewMessageText(""); // reset text entry box
      await convex
        .transaction("sendMessage")
        .call(channelId, newMessageText, randomName);
    }
  }

  return (
    <main className="py-4">
      <h1 className="text-center">Convex Chat</h1>
      <p className="text-center">
        <span className="badge bg-dark">{randomName}</span>
      </p>

      <div className="main-content">
        <div className="channel-box">
          <div className="list-group shadow-sm my-3">
            {channels.map((channel: any) => (
              <a
                key={channel._id}
                className="list-group-item channel-item d-flex justify-content-between"
                style={{
                  display: "block",
                  fontWeight: channel._id.equals(channelId) ? "bold" : "normal",
                }}
                onClick={() => setChannelId(channel._id)}
              >
                {channel.name}
              </a>
            ))}
          </div>
          <form
            onSubmit={handleAddChannel}
            className="d-flex justify-content-center"
          >
            <input
              value={newChannelName}
              onChange={(event) => setNewChannelName(event.target.value)}
              className="form-control w-50"
              placeholder="Add a channel..."
            />
            <input type="submit" value="Add" className="ms-2 btn btn-primary" />
          </form>
        </div>

        <div className="chat-box">
          <ul className="list-group shadow-sm my-3">
            {messages.slice(-10).map((message: any) => (
              <li
                key={message._id}
                className="list-group-item d-flex justify-content-between"
              >
                <div>
                  <strong>{message.author}:</strong> {message.body}
                </div>
                <div className="ml-auto text-secondary text-nowrap">
                  {new Date(message.time).toLocaleTimeString()}
                </div>
              </li>
            ))}
          </ul>
          <form
            onSubmit={handleSendMessage}
            className="d-flex justify-content-center"
          >
            <input
              value={newMessageText}
              onChange={(event) => setNewMessageText(event.target.value)}
              className="form-control w-50"
              placeholder="Write a message…"
              disabled={channelId === null}
            />
            <input
              type="submit"
              value="Send"
              disabled={channelId === null}
              className="ms-2 btn btn-primary"
            />
          </form>
        </div>
      </div>
    </main>
  );
}
