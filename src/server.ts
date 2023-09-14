import type * as Party from "partykit/server";
import {
  GO_AWAY_SENTINEL,
  SLOW_DOWN_SENTINEL,
  createUpdateMessage,
  parseReactionMessage,
} from "./types";

const json = (response: string) =>
  new Response(response, {
    headers: {
      "Content-Type": "application/json",
    },
  });

type RateLimiter = { nextAllowedTime?: number; violations: number };
type RateLimitedConnection = Party.Connection & RateLimiter;
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

  onConnect(conn: RateLimitedConnection) {
    // on WebSocket connection, send the current reaction counts
    conn.send(createUpdateMessage(this.reactions));
  }

  onMessage(message: string, sender: RateLimitedConnection) {
    // rate limit incoming messages
    this.rateLimit(sender, 100, () => {
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

  rateLimit(
    sender: RateLimitedConnection,
    cooldownMs: number,
    action: () => void
  ) {
    // in case we hibernated, load the last known state
    if (!sender.nextAllowedTime) {
      const limiter = sender.deserializeAttachment() as RateLimiter;
      sender.nextAllowedTime = limiter.nextAllowedTime ?? Date.now();
      sender.violations = limiter.violations ?? 0;
    }

    // if we're allowed to send a message, do it
    if (sender.nextAllowedTime <= Date.now()) {
      action();
      // reset rate limiter
      sender.nextAllowedTime = Date.now();
      sender.violations = 0;
    } else {
      // otherwise warn/ban the connection
      sender.violations++;
      if (sender.violations < 10) {
        sender.send(SLOW_DOWN_SENTINEL);
      } else {
        sender.send(GO_AWAY_SENTINEL);
        sender.close();
      }
    }

    // increment cooldown periud
    sender.nextAllowedTime += cooldownMs;

    // save rate limiter state in case we hibernate
    sender.serializeAttachment({
      nextAllowedTime: sender.nextAllowedTime,
      violations: sender.violations,
    });
  }
}

ReactionServer satisfies Party.Worker;
