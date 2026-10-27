import { z } from "zod";
export const nodeId = z.enum(["node-01", "node-02", "node-03"]);
export const intentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("show") }).strict(),
  z.object({ kind: z.literal("filter"), node: nodeId.nullable() }).strict(),
  z.object({ kind: z.literal("highlight"), node: nodeId }).strict(),
  z
    .object({ kind: z.literal("sort"), order: z.enum(["asc", "desc"]) })
    .strict(),
  z.object({ kind: z.literal("reset") }).strict(),
  z.object({ kind: z.literal("dismiss") }).strict(),
]);
export type Intent = z.infer<typeof intentSchema>;
export const snapshotSchema = z
  .object({
    version: z.literal(1),
    source: z.literal("mock-fixture"),
    sampledAt: z.string().datetime(),
    unit: z.literal("percent"),
    nodes: z
      .array(z.object({ id: nodeId, cpu: z.number().min(0).max(100) }).strict())
      .length(3),
  })
  .strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
// Proposed local port, NOT a claim about an existing portal endpoint.
export interface MetricsPort {
  readCpu(): Snapshot;
}
export const mockMetrics: MetricsPort = {
  readCpu: () =>
    snapshotSchema.parse({
      version: 1,
      source: "mock-fixture",
      sampledAt: "2026-10-27T08:00:00Z",
      unit: "percent",
      nodes: [
        { id: "node-01", cpu: 32 },
        { id: "node-02", cpu: 78 },
        { id: "node-03", cpu: 51 },
      ],
    }),
};
export interface IntentProvider {
  interpret(prompt: string): unknown;
}
// Exact grammar deliberately rejects guesses, compound instructions and unknown nodes.
export const simulatedIntent: IntentProvider = {
  interpret(prompt) {
    const text = prompt
      .trim()
      .toLowerCase()
      .replace(/[.!?]$/, "");
    if (text === "show cpu across three nodes") return { kind: "show" };
    if (text === "reset") return { kind: "reset" };
    if (text === "dismiss") return { kind: "dismiss" };
    if (text === "show all nodes") return { kind: "filter", node: null };
    if (text === "sort by cpu descending")
      return { kind: "sort", order: "desc" };
    if (text === "sort by cpu ascending") return { kind: "sort", order: "asc" };
    const match = /^(?:show only|highlight) (node-0[123])$/.exec(text);
    if (match)
      return text.startsWith("highlight")
        ? { kind: "highlight", node: match[1] }
        : { kind: "filter", node: match[1] };
    throw new Error(
      "Unsupported or ambiguous request. Try one of the examples below; no changes were made.",
    );
  },
};
export interface State {
  visible: boolean;
  filter: z.infer<typeof nodeId> | null;
  highlight: z.infer<typeof nodeId> | null;
  order: "asc" | "desc";
  selected: z.infer<typeof nodeId> | null;
}
export const initial: State = {
  visible: false,
  filter: null,
  highlight: null,
  order: "asc",
  selected: null,
};
export function reduce(state: State, raw: unknown): State {
  const intent = intentSchema.parse(raw);
  if (intent.kind === "reset") return { ...initial };
  if (intent.kind === "show") return { ...state, visible: true };
  if (intent.kind === "dismiss")
    return { ...state, visible: false, selected: null };
  if (!state.visible)
    throw new Error("First ask: show CPU across three nodes.");
  switch (intent.kind) {
    case "filter":
      return { ...state, filter: intent.node, selected: null };
    case "highlight":
      return { ...state, highlight: intent.node };
    case "sort":
      return { ...state, order: intent.order };
  }
}
export function rows(snapshot: Snapshot, state: State) {
  return snapshot.nodes
    .filter((n) => !state.filter || n.id === state.filter)
    .sort((a, b) => (state.order === "asc" ? a.cpu - b.cpu : b.cpu - a.cpu));
}
