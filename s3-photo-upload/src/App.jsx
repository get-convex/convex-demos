import { useRef, useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";

export default function App() {
  const messages = useQuery("listMessages") || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("sendMessage");

  const [selectedImage, setSelectedImage] = useState(null);
  const imageInput = useRef(null);

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    // reset image entry
    setSelectedImage(null);
    imageInput.current.value = "";
    if (selectedImage) {
      const url = `/api/upload-image?author=${name}&imgName=${selectedImage.name}`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
    }
    if (newMessageText) {
      await sendMessage(newMessageText, name, "text");
    }
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
            {message.format === "s3" ? (
              <span>
                <img
                  src={`/api/get-image/${message.body}`}
                  height="300px"
                  width="auto"
                />
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
          disabled={selectedImage !== null}
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          onChange={event => setSelectedImage(event.target.files[0])}
          className="ms-2 btn btn-primary"
          disabled={newMessageText != ""}
        />
        <input
          type="submit"
          value="Send"
          disabled={!newMessageText && !selectedImage}
        />
      </form>
    </main>
  );
}
