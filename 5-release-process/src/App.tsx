import { useState, FormEvent, useEffect } from "react";
import { Id } from "convex-dev/values";
import { Message } from "./common";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useConvex } from "../convex/_generated";

// Render a chat message.
function MessageView(props: { message: Message }) {
  const message = props.message;
  if (message.format == "giphy") {
    return (
      <div>
        <div>
          <strong>{message.author}:</strong>
        </div>
        <iframe src={message.body} />
        <div className="giphy-attribution">Powered By GIPHY</div>
      </div>
    );
  }
  return (
    <div>
      <strong>{message.author}:</strong> {message.body}
    </div>
  );
}

function ChatBox(props: { channelId: Id; idToken: string | null }) {
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

    // If a /giphy command is entered call into the Netlify function to post
    // relevant GIF to channel.
    if (newMessageText.startsWith("/giphy ")) {
      await fetch("/.netlify/functions/post-gif", {
        method: "POST",
        body: JSON.stringify({
          channel: props.channelId!.toJSON(),
          token: props.idToken,
          query: newMessageText.slice(7),
        }),
      });
    } else {
      await sendMessage(props.channelId, "text", newMessageText);
    }
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

function LoginLogout() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } =
    useAuth0();
  if (isLoading) {
    return <button className="btn btn-primary">Loading...</button>;
  }
  if (isAuthenticated) {
    return (
      <div>
        {/* We know that Auth0 provides the user's name, but it's worth checking
        depending on the provider. */}
        <p>Logged in as {user!.name}</p>
        <button
          className="btn btn-primary"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          Log out
        </button>
      </div>
    );
  } else {
    return (
      <button className="btn btn-primary" onClick={loginWithRedirect}>
        Log in
      </button>
    );
  }
}

export default function App() {
  const { isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();
  const [userId, setUserId] = useState<Id | null>(null);
  const convex = useConvex();
  const storeUser = useMutation("storeUser");
  const addChannel = useMutation("addChannel");
  const [idToken, setIdToken] = useState<string | null>(null);
  // Pass the ID token to the Convex client when logged in, and clear it when logged out.
  // After setting the ID token, call the `storeUser` mutation function to store
  // the current user in the `users` table and return the `Id` value.
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      getIdTokenClaims().then(async claims => {
        // Get the raw ID token from the claims.
        const token = claims!.__raw;
        setIdToken(token);
        // Pass it to the Convex client.
        convex.setAuth(token);
        // Store the user in the database.
        const id = await storeUser();
        setUserId(id);
      });
    } else {
      // Tell the Convex client to clear all authentication state.
      convex.clearAuth();
      setUserId(null);
    }
  }, [isAuthenticated, isLoading, getIdTokenClaims, convex, storeUser]);

  // Dynamically update `channels` in response to the output of
  // `listChannels.ts`.
  const channels = useQuery("listChannels") || [];

  // Records the Convex document ID for the currently selected channel.
  const [channelId, setChannelId] = useState<Id | null>(null);

  // Run `addChannel.ts` as a mutation to create a new channel when
  // `handleAddChannel` is triggered.
  const [newChannelName, setNewChannelName] = useState("");

  async function handleAddChannel(event: FormEvent) {
    event.preventDefault();
    setNewChannelName("");
    const id = await addChannel(newChannelName);
    setChannelId(id);
  }

  return (
    <main className="py-4">
      <h1 className="text-center">Convex Chat</h1>
      <div className="text-center">
        <span>
          <LoginLogout />
        </span>
      </div>
      <br />
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
              disabled={userId === null}
            />
            <input
              type="submit"
              value="Add"
              className="ms-2 btn btn-primary"
              disabled={!newChannelName || userId === null}
            />
          </form>
        </div>
        {channelId ? <ChatBox channelId={channelId} idToken={idToken} /> : null}
      </div>
    </main>
  );
}
