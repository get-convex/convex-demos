import { useState, useRef, FormEvent } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";
import { Document } from "../convex/_generated/dataModel";

const randomName = "User " + Math.floor(Math.random() * 10000);

// Render a chat message.
function MessageView(props: { message: Document<"messages"> }) {
  const message = props.message;

  if (message.format == "s3") {
    return <Image message={message} />;
  }

  return (
    <div>
      <strong>{message.author}:</strong> {message.body}
    </div>
  );
}

function Image(props: { message: Document<"messages"> }) {
  const message = props.message;
  return (
    <div>
      <strong>{message.author}:</strong>
      <img src={`/api/get-image/${message.body}`} height="300px" width="auto" />
    </div>
  );
}

export default function App() {
  // Dynamically update `messages` in response to the output of
  // `listMessages.ts`.
  const messages = useQuery("listMessages") || [];

  // Run `sendMessage.ts` as a mutation to record a chat message when
  // `handleSendMessage` triggered.
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setNewMessageText(""); // reset text entry box

    // reset image entry
    setSelectedImage(null);
    imageInput.current!.value = "";
    if (selectedImage) {
      const url = `/api/upload-image?author=${randomName}&imgName=${selectedImage.name}`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
    }

    if (newMessageText) {
      await sendMessage(newMessageText, randomName, "text");
    }
  }
  return (
    <main className="py-4">
      <h1 className="text-center">Convex Chat</h1>
      <p className="text-center">
        <span className="badge bg-dark">{randomName}</span>
      </p>
      <ul className="list-group shadow-sm my-3">
        {messages.slice(-10).map((message: any) => (
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
      <form
        onSubmit={handleSendMessage}
        className="d-flex justify-content-center"
      >
        <input
          value={newMessageText}
          onChange={event => setNewMessageText(event.target.value)}
          className="form-control w-50"
          placeholder="Write a message…"
          disabled={selectedImage != null}
        />
        <input
          type="submit"
          value="Send"
          className="ms-2 btn btn-primary"
          disabled={!newMessageText && !selectedImage}
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          onChange={event => setSelectedImage(event.target.files![0])}
          className="ms-2 btn btn-primary"
          disabled={newMessageText != ""}
        />
      </form>
    </main>
  );
}
