import { Reactions } from "./components/Reactions";

const ROOM_ID = "next";

export default async function Home() {
  // fetch initial data in server component for server rendering
  const roomHost = "example-reactions.jevakallio.partykit.dev";
  const roomId = ROOM_ID;
  const req = await fetch(`https://${roomHost}/party/${roomId}`, {
    method: "GET",
    next: { revalidate: 0 },
  });

  // onRequest handler will respond with initial data
  const res = (await req.json()) as { reactions: Record<string, number> };

  // pass initial data to client, which will connect to the room via WebSockets
  return (
    <main>
      <Reactions
        roomHost={roomHost}
        roomId={roomId}
        initialData={res.reactions}
      ></Reactions>
    </main>
  );
}
