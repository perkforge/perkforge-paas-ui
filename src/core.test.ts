import { describe, it, expect } from "vitest";
import {
  initial,
  reduce,
  simulatedIntent,
  mockMetrics,
  snapshotSchema,
  rows,
} from "./core";
const apply = (state: typeof initial, text: string) =>
  reduce(state, simulatedIntent.interpret(text));
describe("acceptance: offline workspace", () => {
  it("shows three validated CPU records and keeps a single repeatable component", () => {
    const s = apply(initial, "show CPU across three nodes");
    expect(rows(mockMetrics.readCpu(), s)).toHaveLength(3);
    expect(apply(s, "show CPU across three nodes")).toEqual(s);
  });
  it("modifies the same chart with filter, highlight and sort", () => {
    let s = apply(initial, "show CPU across three nodes");
    s = apply(s, "highlight node-02");
    s = apply(s, "sort by CPU descending");
    expect(rows(mockMetrics.readCpu(), s)[0].id).toBe("node-02");
    expect(s.highlight).toBe("node-02");
    s = apply(s, "show only node-03");
    expect(rows(mockMetrics.readCpu(), s).map((n) => n.id)).toEqual([
      "node-03",
    ]);
    expect(
      rows(mockMetrics.readCpu(), apply(s, "show all nodes")),
    ).toHaveLength(3);
  });
  it("rejects unknown, ambiguous and compound requests without modifying state", () => {
    const s = apply(initial, "show CPU across three nodes");
    for (const x of [
      "show CPU",
      "highlight node-04",
      "delete tenant",
      "show only node-01 and node-02",
      "",
    ])
      expect(() => apply(s, x)).toThrow();
    expect(s).toEqual(apply(initial, "show CPU across three nodes"));
  });
  it("requires a chart for follow-ups and supports dismiss/reset/reopen", () => {
    expect(() => apply(initial, "highlight node-02")).toThrow();
    let s = apply(initial, "show CPU across three nodes");
    s = apply(s, "show only node-02");
    expect(apply(s, "dismiss").visible).toBe(false);
    expect(apply(s, "reset")).toEqual(initial);
    expect(
      apply(apply(s, "dismiss"), "show CPU across three nodes").visible,
    ).toBe(true);
  });
  it("rejects arbitrary fields/code and invalid data at runtime boundaries", () => {
    expect(() => reduce(initial, { kind: "show", code: "alert(1)" })).toThrow();
    expect(() => reduce(initial, { kind: "execute", command: "sh" })).toThrow();
    const data = mockMetrics.readCpu();
    expect(() =>
      snapshotSchema.parse({ ...data, nodes: [{ id: "node-01", cpu: 101 }] }),
    ).toThrow();
    expect(mockMetrics.readCpu()).toEqual(data);
  });
});
