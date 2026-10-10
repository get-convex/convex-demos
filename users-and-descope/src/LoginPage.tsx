import { Descope } from "@descope/react-sdk";

export default function LoginPage() {
  return (
    <main>
      <h1>Convex Chat</h1>
      <h2>
        <Descope flowId="sign-up-or-in" />
      </h2>
    </main>
  );
}
