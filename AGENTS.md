# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Wod Forge** is a single-page React + Vite app (no backend, no database). All workout data is static in `src/App.tsx`; training logs persist in the browser via `localStorage`.

### Services

| Service | Command | Port |
|---------|---------|------|
| Dev server (primary) | `npm run dev` | 5173 (Vite default) |
| Production preview | `npm run preview` (after `npm run build`) | 4173 (Vite preview default) |

Only one process is required for development or manual E2E testing.

### Standard commands

See `README.md` and `package.json` scripts:

- **Install / refresh deps:** `npm install`
- **Dev:** `npm run dev` — add `-- --host 0.0.0.0 --port 5173` when the app must be reachable outside localhost (e.g. Cloud Agent browser testing).
- **Build (includes typecheck):** `npm run build` — runs `tsc --noEmit` then `vite build`
- **Preview prod build:** `npm run preview`

There is **no** ESLint, Prettier, or test runner configured in this repo. Use `npm run build` as the primary automated quality gate.

### Dev server in tmux

For long-running `npm run dev`, use a named tmux session (e.g. `vite-dev-server`) so the process survives across shell invocations. Reuse an existing session with `tmux -f /exec-daemon/tmux.portal.conf ls` before starting a new one.

### Hello-world / E2E smoke path

1. Open the app (default `http://127.0.0.1:5173/`).
2. Set a **Focus** filter and click **Random from filters**.
3. Review the workout briefing, optionally **Start** the WOD clock.
4. Enter score/notes under **Training Log** and check **Mark workout complete** — the **Logged** count should increment (stored in `localStorage`).
