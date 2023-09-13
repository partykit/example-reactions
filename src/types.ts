import z from "zod";

const allowedReactions = [z.literal("clap"), z.literal("heart")] as const;

// client sends a message either via WebSocket or HTTP
// { type: "reaction", kind: "clap" }
const ReactionSchema = z.object({
  type: z.literal("reaction"),
  kind: z.union(allowedReactions),
});

// server responds with an updated count of reactions
// { type: "update", reactions: { clap: 1, heart: 2 } }
const ReactionUpdateSchema = z.object({
  type: z.literal("update"),
  reactions: z.record(z.number()),
});

export const parseMessage = (message: string) => {
  return ReactionSchema.parse(JSON.parse(message));
};

export const createMessage = (kind: string) => {
  return JSON.stringify(
    ReactionSchema.parse({
      type: "reaction",
      kind,
    })
  );
};

export const parseUpdate = (message: string) => {
  return ReactionUpdateSchema.parse(JSON.parse(message));
};

export const createUpdate = (reactions: Record<string, number>) => {
  return JSON.stringify(
    ReactionUpdateSchema.parse({
      type: "update",
      reactions,
    })
  );
};
