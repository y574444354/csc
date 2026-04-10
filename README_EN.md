# CoStrict

**Enterprise-Grade AI Programming Assistant · Terminal Native**

[Quick Start](#quick-start) · [Architecture](#architecture-overview) · [Deployment](#self-hosted-deployment) · [API Protocol](#multi-api-protocol-compatibility) · [CoStrict Modules](#costrict-specific-modules)

---

## What is CoStrict

CoStrict is a free open-source AI-assisted programming tool designed for enterprise development scenarios. Supports self-hosted deployment, making it the best choice for organization-level secure and standardized AI development workflows.

| Capability | Description |
|------|------|
| **CoStrict Enterprise Auth** | OAuth 2.0 + Casdoor SSO, automatic Token refresh, device fingerprint binding |
| **8 API Protocols** | CoStrict / Anthropic / OpenAI / Gemini / Grok / Bedrock / Vertex / Foundry |
| **53+ Built-in Tools** | File I/O, Shell execution, Web search, Agent orchestration, MCP extensions — ready to use |
| **16 Structured Agents** | Strict requirement analysis → architecture design → task planning → coding → verification full pipeline |
| **Self-hosted Deployment** | Remote Control Server (Docker) + Bridge Mode, data stays within internal network |
| **Feature Flag System** | 19+ default features + environment variable hot-switches, enable on-demand without code changes |
| **Security & Compliance** | Tiered permission modes, Policy gateway, Worktree isolation, audit logs |
| **Cross-platform** | macOS / Windows / Linux, Computer Use + Chrome Use dual-channel UI automation |

---

## Quick Start

### Installation

```bash
bun i -g @costrict/xxx
csc
```

### From Source

**Requirements**: [Bun](https://bun.sh/) >= 1.2.0

```bash
git clone https://github.com/y574444354/csc.git
cd csc
bun install
bun run dev       # Version shows 888 when successful
bun run build     # Production build → dist/cli.js + chunk files
```

### First-time Login

After starting, enter `/login` in the REPL. CoStrict provides two authentication options:

**1. CoStrict Enterprise Login (Recommended)**

Browser opens CoStrict OAuth page automatically. After SSO login, credentials are written automatically:

```
/login → Select CoStrict → Browser SSO login → Auto-complete
```

- Authentication service: `https://zgsm.sangfor.com/oidc-auth`
- Credential storage: `~/.claude/csc-auth.json` (0600 permissions)
- Auto refresh: Three-layer Token validation + preventive refresh + 401 reactive recovery

**2. Third-party API Direct Connection**

Select Anthropic Compatible / OpenAI / Gemini and fill in Base URL and API Key:

| Field | Description | Example |
|-------|-------------|---------|
| Base URL | API service URL | `https://api.example.com/v1` |
| API Key | Authentication key | `sk-xxx` |
| Haiku Model | Fast model | `claude-haiku-4-5-20251001` |
| Sonnet Model | Balanced model | `claude-sonnet-4-6` |
| Opus Model | High-performance model | `claude-opus-4-6` |

You can also edit `~/.claude/settings.json` directly:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.example.com/v1",
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-5-20251001",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-4-6"
  }
}
```

---

## CoStrict Specific Modules

### Enterprise Authentication (`src/costrict/provider/`)

| Module | Responsibility |
|------|------|
| `auth.ts` | OAuth 2.0 login flow: browser redirect, Token polling, credential save |
| `credentials.ts` | Credential management: read/write `csc-auth.json`, device fingerprint SHA256 generation |
| `token.ts` | Token lifecycle: JWT parsing, three-layer validation, auto-refresh |
| `fetch.ts` | Request middleware: dynamic Authorization + custom Headers injection, preventive/reactive Token refresh |
| `oauth-params.ts` | OAuth parameter construction: Casdoor provider identifier, plugin version, URI Scheme |
| `models.ts` | Dynamic model list: fetch available models from AI Gateway, 1-hour cache |
| `modelMapping.ts` | Model name resolution: 5-level priority mapping Anthropic model names to CoStrict model IDs |
| `index.ts` | Query entry: reuse OpenAI compatible path, inject CoStrict fetch and baseURL |

**Token Refresh Strategy**:

```
Request start → Read credentials → Token expired?
  ├─ No → Normal request (inject Authorization + X-Costrict-* headers)
  └─ Yes → refresh_token refresh → Success?
       ├─ Yes → Update credentials → Normal request
       └─ No → Try with old Token → 401?
            ├─ Yes → Refresh again → Retry request
            └─ No → Return original response
```

**Model Name Resolution Priority**:

1. Passed model is already a known CoStrict model ID (user explicitly selected via `/model`)
2. `COSTRICT_MODEL` environment variable (admin global override)
3. `COSTRICT_DEFAULT_{HAIKU|SONNET|OPUS}_MODEL` environment variables (by family mapping)
4. First available model from cached model list
5. Pass through original model name (fallback)

### Structured Agents (`src/costrict/agents/`)

CoStrict provides strictly phased Agent orchestration covering the full pipeline from requirements to delivery:

| Agent | Phase | Responsibility |
|-------|------|------|
| `strictSpec` | Requirements | Requirement clarification → architecture design → task planning → execution (four-stage workflow) |
| `requirement` | Requirements | User requirements → structured system requirements document |
| `designAgent` | Design | Requirements document → C4 Model architecture design |
| `taskPlan` | Planning | Requirements + design → high-level task planning |
| `strictPlan` | Planning | User requirements → actionable implementation plan |
| `subCoding` | Coding | Efficient low-cost code implementation |
| `taskCheck` | Verification | Task quality check and improvement |
| `tddTestDesign` | Testing | Functional requirements → test case design |
| `tddTestPrepare` | Testing | Test environment preparation |
| `tddRunAndFix` | Testing | Execute verification → auto-fix |
| `tddTestAndFix` | Testing | Test execution and diagnostic repair |
| `codeReviewSecurity` | Security | Code security audit |
| `quickExplore` | Exploration | Quick project exploration and code understanding |
| `wikiProjectAnalyze` | Documentation | Project classification analysis |
| `wikiCatalogueDesign` | Documentation | Document structure design |
| `wikiDocumentGenerate` | Documentation | Technical document generation |
| `wikiIndexGeneration` | Documentation | Index document generation |

**StrictSpec Full Pipeline Orchestration**:

```
User requirements → StrictSpec
  ├─ Stage 1: Requirement → Structured requirements document
  ├─ Stage 2: DesignAgent → C4 Model architecture design
  ├─ Stage 3: TaskPlan → Task planning
  └─ Stage 4: SubCoding → Code implementation
```

### CoStrict Skills (`src/costrict/skill/`)

| Skill | Description |
|------|------|
| `projectWiki` | Project documentation system generation (analysis → design → generation → indexing) |
| `tdd` | TDD full pipeline (design → prepare → execute → fix) |
| `builtin` | Built-in skill registration and indexing |

---

## Multi-API Protocol Compatibility

CoStrict uses stream adapter pattern to convert all API protocols to internal unified format, with zero downstream code changes.

| Protocol | Enable Method | Use Case |
|------|---------|---------|
| **CoStrict** | `/login` select CoStrict or `CLAUDE_CODE_USE_COSTRICT=1` | Enterprise SSO + AI Gateway dynamic models |
| **Anthropic** | Default | Native Messages API |
| **OpenAI** | `CLAUDE_CODE_USE_OPENAI=1` | Ollama / DeepSeek / vLLM |
| **Gemini** | `CLAUDE_CODE_USE_GEMINI=1` | Google Gemini API |
| **xAI Grok** | `CLAUDE_CODE_USE_GROK=1` | xAI Grok API |
| **AWS Bedrock** | `CLAUDE_CODE_USE_BEDROCK=1` | AWS Bedrock |
| **Google Vertex** | `CLAUDE_CODE_USE_VERTEX=1` | Vertex AI |
| **Foundry** | `CLAUDE_CODE_USE_FOUNDRY=1` | Anthropic Foundry |

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│  CLI Entry (cli.tsx) — 12 quick paths + main.tsx full CLI │
├───────────────────────────────────────────────────────────┤
│  REPL Conversation Loop                                    │
│  REPL.tsx → QueryEngine → query() → API Client            │
│  Streaming responses · Tool orchestration · Context       │
│  compression · Memory management                           │
├───────────────┬───────────────────────────────────────────┤
│  CoStrict     │         Generic Tool Layer                │
│  ┌──────────┐ │  ┌─────────────────────────────────────┐  │
│  │ Provider  │ │  │ 53+ Built-in Tools                  │  │
│  │  OAuth    │ │  │ File / Shell / Agent / Web / MCP   │  │
│  │  Token    │ │  │ Cron / Worktree / LSP / Skill      │  │
│  │  Fetch    │ │  └─────────────────────────────────────┘  │
│  │ Models    │ ├───────────────────────────────────────────┤
│  │ Mapping   │ │         Agent Orchestration Layer         │
│  └──────────┘ │  ┌─────────────────────────────────────┐  │
│  ┌──────────┐ │  │ CoStrict Agents (16)                │  │
│  │ Agents   │ │  │ StrictSpec · TDD · Wiki · Security  │  │
│  │  (16)    │ │  └─────────────────────────────────────┘  │
│  └──────────┘ │  ┌─────────────────────────────────────┐  │
│  ┌──────────┐ │  │ Generic Agents                      │  │
│  │ Skills   │ │  │ AgentTool · Team · Coordinator      │  │
│  │  (3)     │ │  │ Fork Subagent · Worktree isolation  │  │
│  └──────────┘ │  └─────────────────────────────────────┘  │
├───────────────┴───────────────────────────────────────────┤
│  API Compatibility Layer (8 protocols) → Unified stream  │
│  adapter → Zero downstream code changes                   │
├───────────────────────────────────────────────────────────┤
│  Infrastructure                                            │
│  Feature Flag · Daemon · Bridge/RCS · Voice Mode          │
│  BG Sessions · Policy gateway · Sentry · GrowthBook       │
└───────────────────────────────────────────────────────────┘
```

### CLI Quick Paths

| Command | Description | Feature Gate |
|------|-------------|-------------|
| `--version` | Version output: `4.0.1 (CoStrict)` | — |
| `--claude-in-chrome-mcp` | Chrome browser control MCP | — |
| `--computer-use-mcp` | Computer Use MCP | `CHICAGO_MCP` |
| `rc` / `bridge` / `remote-control` | Bridge mode | `BRIDGE_MODE` |
| `daemon` | Daemon mode | `DAEMON` |
| `ps` / `logs` / `attach` / `kill` | Background session management | `BG_SESSIONS` |
| `new` / `list` / `reply` | Template tasks | `TEMPLATES` |
| `environment-runner` | BYOC environment runner | `BYOC_ENVIRONMENT_RUNNER` |
| `self-hosted-runner` | Self-hosted runner | `SELF_HOSTED_RUNNER` |
| `--tmux` + `--worktree` | Tmux workspace isolation | — |
| Default path | Full REPL CLI | — |

---

## Tool System

### Built-in Tools Classification

| Category | Tools | Description |
|------|------|------|
| **File Operations** | `FileReadTool` `FileEditTool` `FileWriteTool` `GlobTool` `GrepTool` | Code read/write and search |
| **Shell Execution** | `BashTool` `PowerShellTool` `REPLTool` | Command execution and interactive REPL |
| **Agent Collaboration** | `AgentTool` `TaskCreateTool` `TaskUpdateTool` `TaskListTool` `TaskGetTool` `TaskOutputTool` `TaskStopTool` | Multi-Agent task orchestration |
| **Team Orchestration** | `TeamCreateTool` `TeamDeleteTool` `SendMessageTool` | Agent Team orchestration |
| **Planning & Verification** | `EnterPlanModeTool` `ExitPlanModeTool` `VerifyPlanExecutionTool` | Structured planning and verification |
| **Web & Network** | `WebFetchTool` `WebSearchTool` `WebBrowserTool` | Web page fetching/search/browser automation |
| **MCP Extensions** | `MCPTool` `McpAuthTool` `ListMcpResourcesTool` `ReadMcpResourceTool` | Model Context Protocol |
| **Scheduling & Cron** | `CronCreateTool` `CronDeleteTool` `CronListTool` | Cron scheduled tasks |
| **Workspace** | `EnterWorktreeTool` `ExitWorktreeTool` | Git Worktree isolation |
| **Interaction Helpers** | `AskUserQuestionTool` `TodoWriteTool` `SkillTool` `ToolSearchTool` `DiscoverSkillsTool` `ConfigTool` | User interaction and configuration |
| **Development Assist** | `LSPTool` `NotebookEditTool` `BriefTool` | LSP / Notebook / session summary |
| **Remote Trigger** | `RemoteTriggerTool` `MonitorTool` | Remote Agent trigger and monitoring |
| **Advanced Features** | `SleepTool` `SnipTool` `WorkflowTool` `TungstenTool` | Proactive / workflows / experimental |

### MCP Extensions

```bash
csc mcp serve     # Start MCP server
csc mcp add       # Add MCP service
csc mcp list      # List configured services
```

---

## Feature Flag System

All features are enabled on-demand via `FEATURE_<FLAG_NAME>=1` environment variables.

### Default Enabled (Dev + Build)

| Priority | Feature | Description |
|--------|---------|------|
| Core | `BUDDY` | Pet companion |
| Core | `TRANSCRIPT_CLASSIFIER` | Session auto-classification |
| Core | `BRIDGE_MODE` | Bridge / Remote Control |
| Core | `AGENT_TRIGGERS_REMOTE` | Remote Agent trigger |
| Core | `CHICAGO_MCP` | Computer Use MCP |
| Core | `VOICE_MODE` | Voice input |
| Monitoring | `SHOT_STATS` | Stats panel |
| Monitoring | `PROMPT_CACHE_BREAK_DETECTION` | Cache break detection |
| Monitoring | `TOKEN_BUDGET` | Token budget management |
| P0 | `AGENT_TRIGGERS` | Local Agent trigger |
| P0 | `ULTRATHINK` | Deep thinking |
| P0 | `BUILTIN_EXPLORE_PLAN_AGENTS` | Built-in exploration/planning Agents |
| P0 | `LODESTONE` | Lodestone |
| P1 | `EXTRACT_MEMORIES` | Memory extraction |
| P1 | `VERIFICATION_AGENT` | Verification Agent |
| P1 | `KAIROS_BRIEF` | Kairos summary |
| P1 | `AWAY_SUMMARY` | Offline summary |
| P1 | `ULTRAPLAN` | Super planning |
| P2 | `DAEMON` | Daemon mode |

### On-Demand Enable

| Feature | Description |
|---------|------|
| `BG_SESSIONS` | Background sessions (ps/logs/attach/kill) |
| `FORK_SUBAGENT` | Fork subagent parallel execution |
| `PROACTIVE` | Proactive Agent |
| `KAIROS` | Kairos full features |
| `COORDINATOR_MODE` | Coordinator orchestration mode |
| `TEMPLATES` | Template task system |
| `SSH_REMOTE` | SSH remote connection |
| `WEB_BROWSER_TOOL` | Browser automation |
| `WORKFLOW_SCRIPTS` | Workflow scripts |
| `BYOC_ENVIRONMENT_RUNNER` | BYOC environment runner |
| `SELF_HOSTED_RUNNER` | Self-hosted runner |

```bash
FEATURE_FORK_SUBAGENT=1 FEATURE_BG_SESSIONS=1 bun run dev
```

---

## Workspace Packages

| Package | Description | Status |
|---------|------|--------|
| `@ant/ink` | Forked Ink terminal UI framework | Complete |
| `@ant/computer-use-mcp` | Computer Use MCP Server | Complete |
| `@ant/computer-use-input` | Keyboard/mouse simulation (multi-platform backend) | Complete |
| `@ant/computer-use-swift` | Screenshot + app management (multi-platform) | Complete |
| `@ant/claude-for-chrome-mcp` | Chrome browser control | Complete |
| `remote-control-server` | Self-hosted RCS (Docker + Web UI) | Complete |
| `audio-capture-napi` | Native audio capture | Restored |
| `image-processor-napi` | Image processing | Restored |
| `color-diff-napi` | Color difference calculation | Complete |
| `modifiers-napi` | Keyboard modifier detection | Stub |
| `url-handler-napi` | URL scheme handling | Stub |

---

## Testing & Quality

| Metric | Data |
|--------|------|
| Test count | 2430 tests |
| Test files | 137 files |
| Assertion calls | 3982 expect() |
| Framework | `bun:test` |
| Lint | Biome |
| Format | Biome |

```bash
bun test                                       # Full test suite
bun test src/utils/__tests__/hash.test.ts       # Single file
bun test --coverage                            # Coverage
bun run lint                                    # Static check
bun run health                                  # Health check
```

---

## Development & Debugging

### Common Scripts

| Command | Description |
|------|------|
| `bun run dev` | Development mode (MACRO + all Features) |
| `bun run dev:inspect` | Dev mode with Inspector |
| `bun run build` | Production build (code splitting) |
| `bun run lint:fix` | Auto-fix Lint |
| `bun run format` | Format all |
| `bun run health` | Health check |
| `bun run generate:skills` | Generate Skills index |
| `bun run rcs` | Start RCS |
| `bun run docs:dev` | Docs site (Mintlify) |

### VS Code Debugging

```bash
bun run dev:inspect   # → ws://localhost:8888/xxx
# VS Code: F5 → "Attach to Bun (TUI debug)"
```

---

## Teach Me

Built-in Socratic Q&A learning:

```bash
/teach-me CoStrict architecture
/teach-me Tool system --level beginner --resume
```

---
