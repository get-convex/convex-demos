import { useEffect, useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";
import Badge from "./Badge";
import LogoutButton from "./LogoutButton";

export default function App() {
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation("storeUser");
  // Call the `storeUser` mutation function to store
  // the current user in the `users` table and return the `Id` value.
  useEffect(() => {
    // Store the user in the database.
    // Recall that `storeUser` gets the user information via the `auth`
    // object on the server. You don't need to pass anything manually here.
    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser();
    return () => setUserId(null);
  }, [storeUser]);

  const messages = useQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");

  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText);
  }
  return (
    <main>
      <h1>Convex Chat</h1>
      {Badge()}
      <h2>{LogoutButton()}</h2>
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
        <input
          type="submit"
          value="Send"
          disabled={!newMessageText || !userId}
        />
      </form>
    </main>
  );
}
