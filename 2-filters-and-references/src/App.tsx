import { useState, FormEvent } from "react";
import { Id } from "@convex-dev/react";
import { Message } from "./common";
import { useMutation, useQuery } from "../convex/_generated";

const randomName = "User " + Math.floor(Math.random() * 10000);

// Render a chat message.
function MessageView(props: { message: Message }) {
  const message = props.message;
  return (
    <div>
      <strong>{message.author}:</strong> {message.body}
    </div>
  );
}

function ChatBox(props: { channelId: Id }) {
  // Dynamically update `messages` in response to the output of
  // `listMessages.ts`.
  const messages = useQuery("listMessages", props.channelId) || [];
  const sendMessage = useMutation("sendMessage");

  // Run `sendMessage.ts` as a mutation to record a chat message when
  // `handleSendMessage` triggered.
  const [newMessageText, setNewMessageText] = useState("");
  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setNewMessageText(""); // reset text entry box
    await sendMessage(props.channelId, newMessageText, randomName);
  }

  return (
    <div className="chat-box">
      <ul className="list-group shadow-sm my-3">
        {messages.slice(-10).map((message: any) => (
          <li
            key={message._id}
            className="list-group-item d-flex justify-content-between"
          >
            <MessageView message={message} />
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
          onChange={event => setNewMessageText(event.target.value)}
          className="form-control w-50"
          placeholder="Write a message…"
        />
        <input
          type="submit"
          value="Send"
          disabled={!newMessageText}
          className="ms-2 btn btn-primary"
        />
      </form>
    </div>
  );
}

export default function App() {
  // Dynamically update `channels` in response to the output of
  // `listChannels.ts`.
  const channels = useQuery("listChannels") || [];

  // Records the Convex document ID for the currently selected channel.
  const [channelId, setChannelId] = useState<Id>();

  // Run `addChannel.ts` as a mutation to create a new channel when
  // `handleAddChannel` is triggered.
  const [newChannelName, setNewChannelName] = useState("");

  const addChannel = useMutation("addChannel");

  async function handleAddChannel(event: FormEvent) {
    event.preventDefault();
    setNewChannelName("");
    let id = await addChannel(newChannelName);
    setChannelId(id);
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
              onChange={event => setNewChannelName(event.target.value)}
              className="form-control w-50"
              placeholder="Add a channel..."
            />
            <input
              type="submit"
              value="Add"
              className="ms-2 btn btn-primary"
              disabled={!newChannelName}
            />
          </form>
        </div>
        {channelId ? <ChatBox channelId={channelId} /> : null}
      </div>
    </main>
  );
}
