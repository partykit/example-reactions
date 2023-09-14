import "./styles.css";

import PartySocket from "partysocket";
import {
  GO_AWAY_SENTINEL,
  SLOW_DOWN_SENTINEL,
  createReactionMessage,
  parseUpdateMessage,
} from "./types";

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
    socket.send(createReactionMessage(kind));
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
  if (event.data === SLOW_DOWN_SENTINEL) {
    console.log("Cool down. You're sending too many messages.");
    return;
  }
  if (event.data === GO_AWAY_SENTINEL) {
    // server told us to go away. They already closed the connection, but
    // we'll call socket.close() to stop reconnection attempts
    console.log("Good bye.");
    socket.close();
    return;
  }

  const message = parseUpdateMessage(event.data);
  if (message.type === "update") {
    reactions = { ...reactions, ...message.reactions };
    for (const button of buttons) {
      if (reactions[button.kind]) {
        button.element.setAttribute(
          "data-count",
          reactions[button.kind].toString()
        );
      }
    }
  }
});
