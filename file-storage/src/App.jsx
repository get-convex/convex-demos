import { useRef, useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";

export default function App() {
  const messages = useQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage:sendMessage");

  const generateUploadUrl = useMutation("sendMessage:generateUploadUrl");
  const sendImage = useMutation("sendMessage:sendImage");

  const imageInput = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    if (newMessageText) {
      await sendMessage({ body: newMessageText, author: name });
    }
  }

  async function handleSendImage(event) {
    event.preventDefault();
    setSelectedImage(null);
    imageInput.current.value = "";

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": selectedImage.type },
      body: selectedImage,
    });
    const { storageId } = await result.json();
    // Step 3: Save the newly allocated storage id to the messages table
    await sendImage({ storageId, author: name });
  }

  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>{name}</span>
      </p>
      <ul>
        {messages.map(message => (
          <li key={message._id.toString()}>
            <span>{message.author}:</span>
            {message.format === "image" ? (
              <Image message={message} />
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
      <form onSubmit={handleSendImage}>
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          onChange={event => setSelectedImage(event.target.files[0])}
          className="ms-2 btn btn-primary"
          disabled={selectedImage}
        />
        <input type="submit" value="Send Image" disabled={!selectedImage} />
      </form>
    </main>
  );
}

function Image({ message }) {
  return <img src={message.url} height="300px" width="auto" />;
}
