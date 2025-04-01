import { useUser } from "@descope/react-sdk";

export default function Badge() {
  const { user } = useUser();

  return (
    <p className="badge">
      <span>Logged in{user!.name ? ` as ${user!.name}` : ""}</span>
    </p>
  );
}
