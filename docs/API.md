# API Reference

All API routes return a standard envelope:

```typescript
{ data?: T; error?: string }
```

Import the type from `@/types/hermes`:

```typescript
import type { ApiResponse } from "@/types/hermes";
```

All error handlers must call `logApiError(route, context, error)` from `@/lib/api-logger`.

---

## Agent

### GET /api/agent/files

List agent behaviour files (SOUL.md, HERMES.md, etc.).

**Response:**

```json
{
  "data": [
    { "key": "soul", "name": "SOUL.md", "content": "# SOUL\n...", "path": "~/.hermes/SOUL.md" }
  ]
}
```

### GET /api/agent/files/[key]

Read a single behaviour file by key (e.g. `soul`, `hermes`, `agents`, `user`).

### PUT /api/agent/files/[key]

Update a behaviour file. Body fields are whitelisted — unknown fields are ignored.

```json
{ "content": "# Updated content\n..." }
```

### GET /api/agent/agents-md

Read the project-level AGENTS.md file.

### PUT /api/agent/agents-md

Update the project-level AGENTS.md file.

```json
{ "content": "# Updated AGENTS.md\n..." }
```

### GET /api/agent/env

Read environment variables from `~/.hermes/.env`. Secrets are masked as `sk-...abcd`.

---

## Agents

### GET /api/agents

List currently running agent processes with PID, profile, last activity, and status.

---

## Config

### GET /api/config

Read `~/.hermes/config.yaml` parsed into sections.

### PUT /api/config

Update config. A backup is created automatically before saving.

```json
{ "content": "full config.yaml content as string" }
```

---

## Cron

### GET /api/cron

List all cron jobs with status, schedule, and last run time.

### POST /api/cron

Create a new cron job.

```json
{
  "name": "Daily health check",
  "prompt": "Check system health and report",
  "schedule": "0 9 * * *",
  "deliver": "discord:1492416245520400495"
}
```

### PUT /api/cron

Update an existing cron job.

### DELETE /api/cron

Remove a cron job. Query param: `?id=<job-id>`.

---

## Gateway

### GET /api/gateway

Read gateway status and platform connections (Discord, Telegram, etc.).

---

## Logs

### GET /api/logs

Read recent log entries from `~/.hermes/logs/`.

---

## Memory

### GET /api/memory

Search holographic memory facts. Query param: `?q=<search-term>`.

### POST /api/memory

Create a new memory fact.

```json
{ "content": "fact content", "tags": "tag1,tag2", "category": "general" }
```

### PUT /api/memory

Update an existing memory fact.

```json
{ "id": 123, "content": "updated content", "tags": "new,tags" }
```

### DELETE /api/memory

Remove a memory fact. Query param: `?id=<fact-id>`.

---

## Missions

### GET /api/missions

List all missions with status, timestamps, and output.

### POST /api/missions

Dispatch a new mission.

```json
{
  "templateId": "bug-fix",
  "prompt": "Fix the login timeout issue",
  "profile": "mc-qa-engineer",
  "scope": "half-day",
  "timeout": 10
}
```

### DELETE /api/missions

Cancel a running mission. Query param: `?id=<mission-id>`.

### GET /api/missions/health

Check mission system health (scheduler status, active count).

---

## Monitor

### GET /api/monitor

Aggregated system status: model, provider, uptime, gateway connection, active agents, memory stats.

---

## Personalities

### GET /api/personalities

List available agent personalities.

### PUT /api/personalities

Update personality configuration.

---

## Sessions

### GET /api/sessions

List conversation sessions across all platforms. Supports filtering.

### GET /api/sessions/[id]

Read a single session transcript by ID.

---

## Skills

### GET /api/skills

List all available skills.

### GET /api/skills/[...path]

Read a skill file (SKILL.md or linked files under references/, templates/, scripts/).

---

## Status

### GET /api/status

Basic health check endpoint. Returns `{ "status": "ok" }`.

---

## Stories (Story Weaver)

### GET /api/stories

List all stories. Query params: `?id=<story-id>` for single story.

### POST /api/stories

Create a new story.

```json
{
  "title": "The Last Signal",
  "genre": ["sci-fi", "mystery"],
  "era": ["far-future"],
  "mood": ["tense", "contemplative"],
  "characters": ["Captain Voss", "AI companion"],
  "chapters": 12,
  "wordsPerChapter": 1500,
  "premise": "A deep-space captain receives a signal from a ship lost 200 years ago"
}
```

### PUT /api/stories

Update story (chapter generation, rewrite, extend).

### DELETE /api/stories

Delete a story. Query param: `?id=<story-id>`.

---

## Templates

### GET /api/templates

List all mission templates (built-in + custom).

### POST /api/templates

Create a custom mission template.

### DELETE /api/templates

Remove a custom template. Query param: `?id=<template-id>`.

---

## Tools

### GET /api/tools

List toolsets per platform (Discord, Telegram, CLI).

### PUT /api/tools

Update toolset configuration for a platform.

---

## Update

### GET /api/update

Check for available updates from the remote repository.

### POST /api/update

Trigger an update (pull, build, restart).
