import type * as Party from "partykit/server";
import { createUpdate, parseMessage } from "./types";

const json = (response: string) =>
  new Response(response, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export default class ReactionServer implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };
  reactions: Record<string, number> = {};
  constructor(readonly party: Party.Party) {}

  async onStart() {
    // load reactions to memory
    this.reactions = (await this.party.storage.get("reactions")) ?? {};
  }

  async onRequest(req: Party.Request) {
    // client sends HTTP POST: update reaction count
    if (req.method === "POST") {
      const message = parseMessage(await req.text());
      this.updateAndBroadcastReactions(message.kind);
    }
    // for all HTTP requests, respond with the current reaction counts
    return json(createUpdate(this.reactions));
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // on WebSocket connection, send the current reaction counts
    conn.send(createUpdate(this.reactions));
  }

  onMessage(message: string, sender: Party.Connection) {
    // client sends WebSocket message: update reaction count
    const parsed = parseMessage(message);
    this.updateAndBroadcastReactions(parsed.kind);
  }

  updateAndBroadcastReactions(kind: string) {
    // update stored reaction counts
    this.reactions[kind] = (this.reactions[kind] ?? 0) + 1;

    // send updated counts to all connected listeners
    this.party.broadcast(createUpdate(this.reactions));

    // save reactions to disk (fire and forget)
    this.party.storage.put("reactions", this.reactions);
  }
}

ReactionServer satisfies Party.Worker;
