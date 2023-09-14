"use client";

import { useState } from "react";
import usePartySocket, { useWebSocket } from "partysocket/react";

const reactionTypes = ["clap", "thumbsup", "heart", "party"] as const;
const reactionEmoji = {
  clap: "👏",
  heart: "❤️",
  thumbsup: "👍",
  party: "🎉",
};

type ReactionsProps = {
  initialData: Record<string, number>;
  roomHost: string;
  roomId: string;
};

export const Reactions = (props: ReactionsProps) => {
  // use server-rendered initial data
  const [reactions, setReactions] = useState(props.initialData);

  // update state when new reactions come in
  const socket = usePartySocket({
    host: props.roomHost,
    room: props.roomId,
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      setReactions(message.reactions);
    },
  });

  // render buttons with reaction counts
  return (
    <div className="flex">
      {reactionTypes.map((kind) => (
        <button
          className="m-2 p-2 border border-white flex space-x-2 hover:bg-gray-800"
          key={kind}
          onClick={() => {
            socket.send(JSON.stringify({ type: "reaction", kind }));
          }}
        >
          <span>{reactionEmoji[kind]}</span>
          <span>{reactions[kind] ?? 0}</span>
        </button>
      ))}
    </div>
  );
};
