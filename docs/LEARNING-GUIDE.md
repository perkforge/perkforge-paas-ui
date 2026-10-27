# Perkforge workspace lab

A small, separate React + TypeScript learning prototype. **Simulated intent, fixed mock data, no live LLM, metrics, credentials, deployment or cluster connection.** Runtime application requests remain entirely local after installation. No external fonts or analytics.

## Run

Node 22.12+ and npm: `npm ci`, `npm run dev`. Vite binds only `127.0.0.1:5173`. Stop with Ctrl-C. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Five-minute demo / acceptance script

1. Start empty. Submit **show CPU across three nodes**. See one chart with a MOCK DATA badge and timestamp.
2. Submit **highlight node-02**, then **sort by CPU descending**. The same chart changes; node-02 leads at 78%.
3. Click node-02 (or keyboard Tab/Enter). Inspect its raw record, unit, source and fixed sample time.
4. Submit **show only node-03**, then **show all nodes**. Verify one then three rows.
5. Repeat the initial request: no duplicate chart. Submit **delete tenant** or **show CPU**: an explicit error, previous chart unchanged.
6. Dismiss; a follow-up reports that a chart is required. Reopen, then Reset workspace returns to empty.
7. At 390px width, check the stacked layout, labelled input, keyboard focus and inspection panel.

There is one chart, so rearrangement has no useful meaning yet; it is intentionally deferred.

## Read the code as a pipeline

- `src/main.tsx`, `submit`: prompt enters the swappable provider, parsed intent enters reducer, errors retain state.
- `src/core.ts`, `simulatedIntent`: honest exact-phrase grammar, not language understanding. It returns `unknown`, just as an untrusted remote model would.
- `intentSchema`: strict runtime allowlist of six actions; extra keys and arbitrary code fail. TypeScript alone would not protect this boundary.
- `MetricsPort` / `snapshotSchema` / `mockMetrics`: proposed local API adapter contract, validated fixed fixture. This is **not** an existing portal HTTP endpoint.
- `reduce`: pure deterministic state transitions. Repeating show is idempotent; follow-ups need an open component. Chart identity is the single `cpu-overview` workspace slot.
- `rows`: filtering and sorting produce a new view without mutating source data.
- `src/main.tsx`, chart/inspection: trusted React markup; direct interaction updates selected node, never infrastructure. No generated JS, HTML, shell or eval.
- `src/core.test.ts`: executable acceptance coverage for show/follow-up/repeat/reject/reset/schema flows.

## What this proves

A small contract can turn a request into an inspectable interactive component, preserve state across follow-ups, and separate intent from evidence and rendering. It does not prove model reliability, streaming, real telemetry, tenant isolation, Keycloak integration, production security, or operational readiness. It is secondary to platform stability and does not replace the conventional portal.

See [proposed ADR and plan](ADR-001.md).

