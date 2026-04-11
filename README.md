# Hermes Mission Control

A command centre dashboard for [Hermes Agent](https://github.com/NousResearch/hermes-agent). Monitor your agent fleet, dispatch missions, manage configurations, and control everything from one place.

![Dashboard](screenshots/Hermes_Dashboard.png)

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Live stats, active missions, system health, collapsible mission dispatch |
| **Missions** | 29 built-in templates across 8 categories, with 8 specialist agent profiles |
| **Agent Profiles** | QA, DevOps, SWE, Data, Data Science, Ops, Creative, Support specialists |
| **Cron Manager** | Schedule, edit, and monitor recurring tasks (1m to 7d intervals) |
| **Agent Behaviour** | Edit SOUL.md, HERMES.md, AGENTS.md, and more |
| **Config Editor** | Full config.yaml editing with 27 sections |
| **Session Browser** | View conversation transcripts across all gateways |
| **Memory** | Manage holographic memory facts |
| **Skills** | Browse skills, view SKILL.md and linked files |
| **Tools** | Toggle toolsets per platform |
| **Gateway** | Monitor platform connections (Discord, Telegram, etc.) |
| **Logs** | Browse recent log entries for quick triage |
| **Story Weaver** | Collaborative AI fiction — create worlds, write chapters, build stories |

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/Daniel-Parke/hermes-mission-control.git ~/mission-control
cd ~/mission-control
bash scripts/install.sh
```

Or install without cloning:

```bash
bash <(curl -s https://raw.githubusercontent.com/Daniel-Parke/hermes-mission-control/main/scripts/install.sh)
```

The dashboard will be available at `http://localhost:3000`.

---

## Prerequisites

- **Node.js** 18+
- **Hermes Agent** installed at `~/.hermes/` (run `hermes update` first)

---

## User Guide

### The Dashboard

The dashboard is your command centre. At a glance you see:

- **System status** — model, provider, uptime, gateway connection
- **Active missions** — currently running agent tasks
- **Cron jobs** — scheduled tasks with status
- **Running agents** — all active agents with last activity
- **Memory** — holographic memory facts and provider status
- **Errors** — recent log entries for quick triage
- **Rec Room** — quick access to Story Weaver

Everything auto-refreshes every 10 seconds.

---

### Dispatching Missions

The Mission Dispatch panel on the dashboard shows 29 built-in templates grouped by category. Click the panel header to expand/collapse. Click any template pill to dispatch instantly. Missions appear under "Active Missions" with a status badge:

| Status | Colour | Meaning |
|--------|--------|---------|
| **Queued** | Orange | Cron job created, waiting for scheduler |
| **Dispatched** | Blue | Agent is working |
| **Successful** | Green | Completed successfully |
| **Failed** | Red | Error or cancelled |

Active missions show a session link (once the agent starts) and a cancel button. Cron job intervals can be edited inline from the dashboard.

### Mission Settings

Each mission has three configurable settings:

- **Mission Scope** (10-60 min): Soft planning guide. "Half Day" (15m) is approximately 4 developer hours of work.
- **Timeout** (5-60 min, default 10m): Inactivity kill switch. Agent terminated if silent for this duration.
- **Interval** (1m-7d): How often recurring missions fire. Default: 5 minutes.

---

### Cron Jobs

Schedule recurring tasks: every 1m, every 5m, every 1h, up to every 7d. Jobs run autonomously and deliver results to your configured platform. Up to 3 jobs run in parallel.

### Agent Behaviour

Edit the files that define your agent's personality and rules:
- **SOUL.md** — personality traits
- **HERMES.md** — priority instructions
- **AGENTS.md** — development context
- **USER.md** — user profile

---

### Configuration

Edit `config.yaml` with 27 organised sections. Changes are validated before saving and a backup is created automatically.

### Sessions

Browse conversation transcripts across all gateway platforms. Filter by platform, search by content, and view full message histories.

---

### Memory

Create, edit, search, and delete holographic memory facts. The memory system helps your agent remember context across sessions.

**Note:** Mission Control supports the [Holographic Memory](https://github.com/NousResearch/hermes-agent) plugin. If holographic memory is not installed, the Memory page will show an install notice and the dashboard will display "Not Installed" — the rest of the dashboard continues to work normally.

---

### Gateway

Monitor platform connections (Discord, Telegram, CLI, etc.) from one place. View connection status, active channels, and gateway uptime. Requires `API_SERVER_ENABLED=true` in `~/.hermes/.env`.

---

### Logs

Browse recent log entries from `~/.hermes/logs/`. Useful for quick triage of errors, gateway issues, or cron job failures without leaving the dashboard.

---

### Skills

Browse all available agent skills with their descriptions. Click a skill to view its full SKILL.md and linked files (references, templates, scripts). Skills are stored in `~/.hermes/skills/`.

---

### Personalities

View and manage agent personality configurations. Personalities define how agents communicate and behave across missions. Each personality is an isolated configuration that can be toggled or customised.

---

## Story Weaver

Collaborative interactive fiction powered by your agent. Create stories from 8 pre-built templates or build your own from scratch.

**Pages:**
- **Dashboard** — overview with stats, recent stories, quick actions
- **Reading Desk** — personal bookshelf to browse and read stories
- **Library** — manage all stories (grid view with CRUD)
- **Create** — new story with template or custom configuration
- **Reader** — continuous scroll with book-like styling and customisable settings

**Create a story:**
1. Navigate to **Rec Room → Story Weaver → Create**
2. Choose a template or configure manually (title, genre, era, mood, characters, chapter length)
3. Click **Begin Writing**
4. The AI generates a Story Arc (plot structure) and first chapter
5. Remaining chapters auto-generate sequentially
6. Read in the **Reading Desk** or **Library**

**Story Arc Pipeline:**
- **Step 1:** AI generates a Story Arc — immutable plot contract with fixed plot points, character arcs, world rules, and chapter outlines
- **Step 2:** Chapter 1 written against the arc with quality standards
- **Step 3:** Rolling narrative summary updated (flexible length, no cap)
- **Step N:** Each subsequent chapter uses: master prompt + story arc + rolling summary + previous chapter + chapter outline

**Reading:**
- Continuous scroll with book-like styling
- Customisable reading experience (font, size, spacing, page theme) via the **Aa** button
- Chapters sidebar with read status indicators
- Next/Previous chapter navigation with chapter titles

**Features:**
- 8 story templates (Sci-Fi, Mystery, Fantasy, Crime, Romance, Horror, Historical, Children's)
- Tag-based genre/era/mood/setting with custom tags
- Configurable chapter word count (800 words to 5000+)
- Auto-generation of chapters with server-side locking
- Chapter rewrite (forward-invalidation from rewrite point)
- Story extension (add more chapters)
- Kindle-style reading settings (font, size, theme, spacing)
- Response validation (strips meta-commentary, prompt artifacts)

---

## Managing Mission Control Dashboard

### Install

```bash
# Standalone installer (auto-clones):
bash <(curl -s https://raw.githubusercontent.com/Daniel-Parke/hermes-mission-control/main/scripts/install.sh)

# Or from a clone:
cd mission-control
bash scripts/install.sh
```

The installer checks prerequisites, detects existing installations, and prompts before overwriting.

### Update

**From the sidebar:** Click "Check" to check for updates. If available, click "Update Now".

**From the terminal:**

```bash
cd ~/mission-control
bash scripts/update.sh
```

The update script fetches from `origin/main`, builds, and restarts. If the build fails, the update aborts without restarting.

### Restart

**From the sidebar:** Click the "Restart" button.

**From the terminal:**

```bash
cd ~/mission-control
bash scripts/restart.sh
```

### Troubleshooting

**Server won't start (port 3000 in use):**

```bash
fuser -k 3000/tcp
npm run start:network
```

**Build fails after update:**

```bash
cat ~/.hermes/logs/mc-update.log
cd ~/mission-control
npm run build
bash scripts/restart.sh
```

**Gateway not running (no cron jobs executing):**

```bash
systemctl --user status hermes-gateway
systemctl --user start hermes-gateway
```

**Gateway API not available (Story Weaver won't generate):**

Ensure `API_SERVER_ENABLED=true` is in `~/.hermes/.env`, then restart the gateway.

**Reset to clean state:**

```bash
cd ~/mission-control
git checkout main
git reset --hard origin/main
npm install
npm run build
bash scripts/restart.sh
```

---

## Agent Profiles

Mission Control ships with 8 specialist agent profiles, each with a tailored identity for focused work in their domain:

| Profile | Role |
|---------|------|
| `mc-qa-engineer` | Quality assurance, bug fixing, test writing |
| `mc-devops-engineer` | Infrastructure, deployment, CI/CD |
| `mc-swe-engineer` | Feature development, code improvement |
| `mc-data-engineer` | Data pipelines, ETL, schemas |
| `mc-data-scientist` | ML models, analytics, experiments |
| `mc-ops-director` | Strategy, finance, market research |
| `mc-creative-lead` | Content, design, marketing |
| `mc-support-agent` | Research, legal, security |

### How Profiles Work

Each profile is an isolated Hermes agent with its own SOUL.md (identity), MEMORY.md (learned knowledge), sessions, and configuration. When you dispatch a mission, the appropriate specialist profile is used automatically. Your main agent (default profile) is never modified.

Profiles are created during installation via `scripts/install.sh`. They live under `~/.hermes/profiles/mc-*/`.

### Customising Profiles

```bash
# Edit a specialist's identity
hermes -p mc-qa-engineer chat
# Or edit directly
nano ~/.hermes/profiles/mc-qa-engineer/SOUL.md
```

### Adding New Profiles

```bash
hermes profile create my-custom-role --clone --no-alias
# Edit the SOUL.md
nano ~/.hermes/profiles/my-custom-role/SOUL.md
# Create a Mission Control template with profile: "my-custom-role"
```

---

## Mission Templates

Mission Control includes 29 built-in templates across 8 categories, each mapped to a specialist agent profile. Templates follow the pattern: **Review → Plan → Implement → Test → Document → Report** for code-focused missions.

### Template Categories (29 templates)

| Category | Templates |
|----------|-----------|
| **Business - Operations** | Market Research, Finance Analysis, Strategy Brief, Operations Review |
| **Engineering - QA** | Bug Fix, Acceptance Tests, Unit & Integration Tests, Regression Scan |
| **Engineering - DevOps** | Code Standards, Performance Optimise, Documentation, Build-Deploy, Refactor |
| **Engineering - Software** | New Feature, Improve & Refactor, Experiment, Review & Fix |
| **Engineering - Data** | Query Optimise, Data Development |
| **Engineering - Data Science** | Analytics Run, Model Development, Model Optimise |
| **Business - Creative** | Content Writing, Design Brief, Social Media, Sales & Leads |
| **Support** | Deep Research, Legal & Compliance, Security Audit |

### Mission Settings

Each mission has three configurable settings:

- **Mission Scope** (10-60 min): Soft planning guide for the agent. "Half Day" (15m) ≈ 4 developer hours of work.
- **Timeout** (5-60 min, default 10m): Inactivity kill switch. Agent terminated if silent for this duration.
- **Interval** (1m-7d): How often recurring missions fire.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Data | Direct file I/O on `~/.hermes/` + SQLite for memory |
| API | RESTful routes under `/api/` |
| State | React hooks (no external state management) |
| Fonts | Literata, EB Garamond, Lora, Merriweather (Google Fonts) |
| LLM | Gateway API Server at `localhost:8642` (OpenAI-compatible) |

All API routes import paths from `src/lib/hermes.ts`. The app reads from `~/.hermes/` but never writes to `config.yaml` directly.

---

## 📸 Screenshots

Explore the core interfaces of the **Hermes Agent Mission Control** platform below.

---

### 🧭 Main Dashboard

![Main Dashboard](screenshots/Hermes_Dashboard.png)

**Central command hub for your entire system**

Monitor active agents, track mission progress, review system health, and quickly navigate to key areas.

---

### 🚀 Mission Dispatch

![Mission Dispatch](screenshots/Mission_Dispatch.png)

**Create and launch missions with precision**

Configure mission parameters, assign agents, and dispatch tasks in real time.

---

### 🧩 Mission Template

![Mission Template](screenshots/Mission_Template.png)

**Reusable blueprints for repeatable workflows**

Standardize common operations and reduce setup time for recurring tasks.

---

### 📄 Mission Page

![Mission Page](screenshots/Mission_Page.png)

**Detailed mission execution view**

Access status, logs, outputs, and performance metrics in one place.

---

### ⏱️ Cron Jobs

![Cron Jobs](screenshots/Cron_Job.png)

**Automate recurring missions**

Manage scheduled workflows with full lifecycle visibility.

---

### 🧠 Agent Behaviour

![Agent Behaviour](screenshots/Agent_Behaviour.png)

**Define agent logic and responses**

Control decision-making patterns and behavioural rules.

---

### 🎭 Agent Personalities

![Agent Personalities](screenshots/Agent_Personalities.png)

**Customize interaction styles**

Shape how agents communicate and behave across missions.

---

### 🛠️ Agent Skills

![Agent Skills](screenshots/Agent_Skills.png)

**Extend agent capabilities**

Configure the actions and functions available to agents.

---

### 🔌 Agent Tools

![Agent Tools](screenshots/Agent_Tools.png)

**Integrations and external tooling**

Manage tools and third-party services agents can use.

---

### ⚙️ Agent Configuration

![Agent Configuration](screenshots/Agent_Configuration.png)

**Full agent control panel**

Adjust permissions, capabilities, and operational settings.
---

## Development

```bash
npm run dev           # Start dev server with hot reload
npm run build         # Production build
npm run test          # Run test suite (181 tests)
npm run start         # Production server (localhost only)
npm run start:network # Production server (accessible on LAN)
```

**Data storage:** Missions, stories, and custom templates are stored at `~/.hermes/mission-control/data/`.

**Environment variables** (optional, in `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `HERMES_HOME` | `~/.hermes` | Path to Hermes home directory |
| `PORT` | `3000` | Server port |
| `API_SERVER_ENABLED` | `true` | Enable Gateway API for Story Weaver |

---

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/API.md) | All REST API endpoints with request/response formats |
| [Architecture](docs/ARCHITECTURE.md) | Directory structure, data flow, design principles |
| [Contributing](docs/CONTRIBUTING.md) | Development setup, code standards, PR checklist |
| [Branching Strategy](docs/BRANCHING.md) | Git workflow, protection rules, agent permissions |

---

## License

MIT
