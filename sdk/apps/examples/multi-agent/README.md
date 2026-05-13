# Agent War Room

A web app that turns multi-agent fan-out into a visual war room. Four specialist agents debate a mission in parallel, stream their responses to the browser in real time via SSE, then feed their findings into a synthesizer agent that produces a decision brief.

## Getting started

Install dependencies:

```bash
bun install
bun run build:sdk
```

Set an API key:

```bash
export CLINE_API_KEY="cline_..."
```

Run:

```bash
bun dev
```

Open http://localhost:3456 in your browser, enter a mission, and watch the agents work.

## What it does

1. You enter a mission in the browser
2. The server spawns four `Agent` instances in parallel via `Promise.all`:
   - Architect (system design and implementation path)
   - Security Analyst (data access, permissions, privacy, and operational risk)
   - Pragmatist (user value, cost, integration burden, and launch path)
   - Skeptic (assumption checks, failure modes, and simpler alternatives)
3. Each agent streams `assistant-text-delta` events to the browser via SSE, rendered in its own live console card
4. Once all four finish, a synthesizer agent combines their findings into a compact decision brief, also streamed live

## Concepts demonstrated

- Running multiple `Agent` instances concurrently with `Promise.all`
- Per-agent `subscribe()` for independent event streams
- Server-Sent Events (SSE) to stream agent output to a browser
- Agent composition: feeding one agent's output as input to another
- Inline HTML frontend served from the same Node.js server (single file, no build step)
- Visual demo design: a dashboard-style agent console with live streams, telemetry, and a recommendation panel

## Notes

For a simpler starting point, see [quickstart](../quickstart). For custom tools and structured workflows, see [code-review-bot](../code-review-bot).
