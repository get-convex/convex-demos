import { useState, FormEvent } from "react";
import { useMutation, usePaginatedQuery } from "../convex/_generated/react";
import { Document } from "../convex/_generated/dataModel";

const randomName = "User " + Math.floor(Math.random() * 10000);

// Render a chat message.
function MessageView(props: { message: Document<"messages"> }) {
  const message = props.message;
  return (
    <div>
      <strong>{message.author}:</strong> {message.body}
    </div>
  );
}

export default function App() {
  // Dynamically update `messages` in response to the output of
  // `listMessages.ts`.
  const { results, status, loadMore } = usePaginatedQuery("listMessages", {
    initialNumItems: 5,
  });

  // Run `sendMessage.ts` as a mutation to record a chat message when
  // `handleSendMessage` triggered.
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");
  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setNewMessageText(""); // reset text entry box
    await sendMessage(newMessageText, randomName);
  }
  return (
    <main className="py-4">
      <h1 className="text-center">Convex Chat</h1>
      <p className="text-center">
        <span className="badge bg-dark">{randomName}</span>
      </p>
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
          className="ms-2 btn btn-primary"
          disabled={!newMessageText}
        />
      </form>
      <ul className="list-group shadow-sm my-3">
        {results.map((message: any) => (
          <li
            key={message._id}
            className="list-group-item d-flex justify-content-between"
          >
            <MessageView message={message} />
            <div className="ml-auto text-secondary text-nowrap">
              {new Date(message._creationTime).toLocaleTimeString()}
            </div>
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-center">
        <button
          className="ms-2 btn btn-primary text-center"
          onClick={() => {
            loadMore!(5);
          }}
          disabled={status !== "CanLoadMore"}
        >
          Load More
        </button>
      </div>
    </main>
  );
}
