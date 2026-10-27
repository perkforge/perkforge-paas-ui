import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  initial,
  intentSchema,
  mockMetrics,
  reduce,
  rows,
  simulatedIntent,
  type State,
} from "./core";
import "./style.css";
const examples = [
  "show CPU across three nodes",
  "highlight node-02",
  "sort by CPU descending",
  "show only node-03",
  "show all nodes",
];
function App() {
  const [state, setState] = useState<State>(initial),
    [prompt, setPrompt] = useState(""),
    [error, setError] = useState(""),
    [trace, setTrace] = useState("No intent yet"),
    [status, setStatus] = useState("Ready for your first request");
  const snapshot = mockMetrics.readCpu();
  function submit(text: string) {
    try {
      const intent = intentSchema.parse(simulatedIntent.interpret(text));
      const next = reduce(state, intent);
      setState(next);
      setTrace(JSON.stringify(intent, null, 2));
      setError("");
      setStatus(`Applied ${intent.kind} to cpu-overview`);
      setPrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid intent");
    }
  }
  const selected = snapshot.nodes.find((n) => n.id === state.selected);
  return (
    <main>
      <header>
        <a className="brand" href="#">
          ✳ Perkforge <span>/ workspace lab</span>
        </a>
        <span className="badge">OFFLINE PROTOTYPE</span>
      </header>
      <section className="intro">
        <p className="eyebrow">A SMALL EXPERIMENT IN INTENT</p>
        <h1>Ask. See. Explore.</h1>
        <p>
          A visual workspace shaped by your words.
          <br />
          Trusted components, with every step in the open.
        </p>
        <div className="notice">
          Simulated intent · Mock metrics · No live model or cluster connection
        </div>
      </section>
      <div className="layout">
        <section className="workspace" aria-label="Visual workspace">
          <div className="section-heading">
            <h2>Your workspace</h2>
            <button onClick={() => submit("reset")}>Reset workspace</button>
          </div>
          {state.visible ? (
            <article className="card">
              <div className="card-head">
                <div>
                  <span className="eyebrow">COMPUTE / SNAPSHOT</span>
                  <h2>CPU across nodes</h2>
                </div>
                <button
                  aria-label="Dismiss CPU chart"
                  onClick={() => submit("dismiss")}
                >
                  Dismiss ×
                </button>
              </div>
              <div className="meta">
                <span className="badge">MOCK DATA</span>
                <span>Fixed fixture · 27 Oct 2026, 08:00 UTC</span>
              </div>
              <p className="hint">
                Select a node to inspect its source record.{" "}
                {state.filter ? `Filtered to ${state.filter}.` : "3 nodes"} ·{" "}
                {state.order === "asc" ? "Lowest" : "Highest"} CPU first
              </p>
              <div className="chart" aria-label="CPU usage chart">
                {rows(snapshot, state).map((n) => (
                  <button
                    className={`bar-row ${state.highlight === n.id ? "highlight" : ""}`}
                    key={n.id}
                    onClick={() => setState({ ...state, selected: n.id })}
                    aria-label={`Inspect ${n.id}, CPU ${n.cpu} percent`}
                  >
                    <span>{n.id}</span>
                    <span className="track">
                      <span style={{ width: `${n.cpu}%` }} />
                    </span>
                    <strong>{n.cpu}%</strong>
                  </button>
                ))}
              </div>
              <div className="scale">
                <span>0%</span>
                <span>CPU utilization</span>
                <span>100%</span>
              </div>
              {selected && (
                <section className="inspection">
                  <h3>{selected.id} · Source record</h3>
                  <p>Source: mock-fixture · snapshot version 1</p>
                  <pre>
                    {JSON.stringify(
                      {
                        ...selected,
                        unit: snapshot.unit,
                        sampledAt: snapshot.sampledAt,
                      },
                      null,
                      2,
                    )}
                  </pre>
                  <button
                    onClick={() => setState({ ...state, selected: null })}
                  >
                    Close inspection
                  </button>
                </section>
              )}
            </article>
          ) : (
            <div className="empty">
              <span>▥</span>
              <h2>Start with a question</h2>
              <p>
                Try “show CPU across three nodes”
                <br />
                to place an interactive chart here.
              </p>
              <button className="primary" onClick={() => submit(examples[0])}>
                Create CPU chart ↗
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(prompt);
            }}
          >
            <label htmlFor="prompt">What would you like to see?</label>
            <div className="input-row">
              <input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="show CPU across three nodes"
                autoComplete="off"
              />
              <button className="primary" type="submit">
                Apply ↗
              </button>
            </div>
          </form>
          <div className="examples">
            {examples.map((x) => (
              <button key={x} onClick={() => submit(x)}>
                {x}
              </button>
            ))}
          </div>
          <p role="status" className="status">
            {status}
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </section>
        <aside>
          <p className="eyebrow">UNDER THE SURFACE</p>
          <h2>Words become state.</h2>
          <p>
            Nothing here executes generated code. A small allowlist connects
            your intent to a component we own.
          </p>
          <ol>
            <li>
              <strong>01 / Interpret</strong>
              <p>Exact example phrases → simulated intent adapter.</p>
            </li>
            <li>
              <strong>02 / Validate</strong>
              <pre>{trace}</pre>
              <p>Runtime schema rejects unknown actions and fields.</p>
            </li>
            <li>
              <strong>03 / Read</strong>
              <p>
                MetricsPort → validated, fixed mock snapshot. No network
                request.
              </p>
            </li>
            <li>
              <strong>04 / Render & update</strong>
              <p>
                One trusted CPU component. Follow-ups change the same state and
                component identity.
              </p>
            </li>
          </ol>
          <div className="boundary">
            A learning surface, separate from the portal. This proves a UI
            contract, not AI understanding or production access control.
          </div>
        </aside>
      </div>
      <footer>
        Perkforge exploration 001 <span>Read only. Deliberately small.</span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
