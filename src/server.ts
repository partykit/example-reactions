import type * as Party from "partykit/server";
import { createUpdateMessage, parseReactionMessage } from "./types";
import { rateLimit } from "./limiter";

const json = (response: string) =>
  new Response(response, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export default class ReactionServer implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };
  constructor(readonly party: Party.Party) {}
  reactions: Record<string, number> = {};

  async onStart() {
    // load reactions from storage on startup
    this.reactions = (await this.party.storage.get("reactions")) ?? {};
  }

  async onRequest(req: Party.Request) {
    // for all HTTP requests, respond with the current reaction counts
    return json(createUpdateMessage(this.reactions));
  }

  onConnect(conn: Party.Connection) {
    // on WebSocket connection, send the current reaction counts
    conn.send(createUpdateMessage(this.reactions));
  }

  onMessage(message: string, sender: Party.Connection) {
    // rate limit incoming messages
    rateLimit(sender, 100, () => {
      // client sends WebSocket message: update reaction count
      const parsed = parseReactionMessage(message);
      this.updateAndBroadcastReactions(parsed.kind);
    });
  }

  updateAndBroadcastReactions(kind: string) {
    // update stored reaction counts
    this.reactions[kind] = (this.reactions[kind] ?? 0) + 1;
    // send updated counts to all connected listeners
    this.party.broadcast(createUpdateMessage(this.reactions));
    // save reactions to disk (fire and forget)
    this.party.storage.put("reactions", this.reactions);
  }
}

ReactionServer satisfies Party.Worker;
