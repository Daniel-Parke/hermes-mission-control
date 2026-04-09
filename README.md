# Mission Control

A command centre dashboard for [Hermes Agent](https://github.com/NousResearch/hermes-agent). Monitor your agent fleet, dispatch missions, manage configurations, and control everything from one place.

![Dashboard](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

## Features

- **Dashboard** — Live stats, active missions, system monitor, running agents
- **Missions** — Create, dispatch, and track agent missions with templates
- **Agent Behaviour** — Edit SOUL.md, HERMES.md, USER.md, MEMORY.md, AGENTS.md
- **Tools Manager** — Toggle toolsets per platform (Discord, Telegram, CLI, etc.)
- **Skills Browser** — Browse and view installed skills
- **Config Editor** — Full config.yaml editing with section-based forms
- **Cron Manager** — Schedule and monitor recurring tasks
- **Session Browser** — View conversation transcripts
- **Memory CRUD** — Manage holographic memory facts
- **Gateway Status** — Monitor platform connections

## Prerequisites

- **Node.js** 18 or later
- **Hermes Agent** installed and configured at `~/.hermes/`

## Installation

```bash
# Clone the repository
git clone https://github.com/TheMightyWej/mission-control.git ~/mission-control
cd ~/mission-control

# Run setup (installs deps, creates data dirs, builds)
bash setup.sh

# Start the server
npm run start
```

The dashboard will be available at `http://localhost:3000`.

## Development

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Production build
npm run lint     # Run ESLint
```

## Configuration

Mission Control reads from your existing Hermes installation. No additional configuration is needed if Hermes is already set up.

**Data storage:** Missions and custom templates are stored at `~/.hermes/mission-control/data/`. This keeps your data portable — it travels with your Hermes config, not the app directory.

**Environment variables** (optional, in `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `HERMES_HOME` | `~/.hermes` | Path to Hermes home directory |
| `PORT` | `3000` | Server port |

## Architecture

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Data:** Direct file I/O on `~/.hermes/` + SQLite for memory
- **API:** RESTful routes under `/api/`
- **State:** React hooks (no external state management)

All API routes import paths from `src/lib/hermes.ts` for consistency. The app reads from `~/.hermes/` but never writes to `config.yaml` directly — all config changes go through the standard Hermes API pattern.

## License

MIT
