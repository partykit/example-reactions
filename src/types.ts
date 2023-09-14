import z from "zod";

export const SLOW_DOWN_SENTINEL = "slowdown";
export const GO_AWAY_SENTINEL = "goaway";

const allowedReactions = ["clap", "heart", "thumbsup", "party"] as const;
const allowedReactionsSchema = z.enum(allowedReactions);

// client sends a message either via WebSocket or HTTP
// { type: "reaction", kind: "clap" }
const ReactionSchema = z.object({
  type: z.literal("reaction"),
  kind: allowedReactionsSchema,
});

// server responds with an updated count of reactions
// { type: "update", reactions: { clap: 1, heart: 2 } }
const ReactionUpdateSchema = z.object({
  type: z.literal("update"),
  reactions: z.record(z.number()),
});

export const parseReactionMessage = (message: string) => {
  return ReactionSchema.parse(JSON.parse(message));
};

export const createReactionMessage = (kind: string) => {
  return JSON.stringify(
    ReactionSchema.parse({
      type: "reaction",
      kind,
    })
  );
};

export const parseUpdateMessage = (message: string) => {
  return ReactionUpdateSchema.parse(JSON.parse(message));
};

export const createUpdateMessage = (reactions: Record<string, number>) => {
  return JSON.stringify(
    ReactionUpdateSchema.parse({
      type: "update",
      reactions,
    })
  );
};
