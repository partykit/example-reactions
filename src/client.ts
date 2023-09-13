import "./styles.css";

import PartySocket from "partysocket";
import { createMessage, parseUpdate } from "./types";

declare const PARTYKIT_HOST: string;

// let's create a new room for each page
const getRoomId = () => {
  let room = window.location.pathname;
  if (room.startsWith("/")) room = room.slice(1);
  if (room.endsWith("/")) room = room.slice(0, -1);
  return room.replaceAll("/", "-") || "default";
};

// A PartySocket is like a WebSocket, except it's a bit more magical.
// It handles reconnection logic, buffering messages while it's offline, and more.
const room = getRoomId();
console.log("room", room);
const socket = new PartySocket({
  host: PARTYKIT_HOST,
  room,
});

const buttons = [...document.querySelectorAll(".reaction")].map((button) => {
  const kind = button.getAttribute("data-kind")!;
  button.addEventListener("click", async () => {
    socket.send(createMessage(kind));
  });

  return {
    kind,
    count: parseInt(button.getAttribute("data-count") ?? "0", 10),
    element: button,
  };
});

let reactions: Record<string, number> = {};

// // You can even start sending messages before the connection is open!
socket.addEventListener("message", (event) => {
  const update = parseUpdate(event.data);
  reactions = { ...reactions, ...update.reactions };

  for (const button of buttons) {
    if (reactions[button.kind]) {
      button.element.setAttribute(
        "data-count",
        reactions[button.kind].toString()
      );
    }
  }
  console.log(reactions);
});

// // Let's listen for when the connection opens
// // And send a ping every 2 seconds right after
// conn.addEventListener("open", () => {
//   add("Connected!");
//   add("Sending a ping every 2 seconds...");
//   // TODO: make this more interesting / nice
//   setInterval(() => {
//     conn.send("ping");
//   }, 1000);
// });
