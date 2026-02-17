# UI Components Orchestration

Single-command pipeline for turning a Figma node into a validated UI component change.

## Goal

- Keep design-to-code flow reproducible.
- Fail fast when local CLI/MCP prerequisites are missing.
- Apply project UI conventions from `docs/` instead of hard-coded component maps.

## Directory Layout

- `scenarios/`: scenario inputs (`.yml`)
- `prompts/`: system prompt fragments for Codex
- `steps/`: pipeline stages
- `lib/`: shared runtime helpers
- `artifacts/`: per-run outputs (local)
- `reports/`: per-run summary reports (local)

## Run

```bash
pnpm ui:run --scenario orchestration/ui-components/scenarios/jjym-toast.yml
```

## Pipeline Stages

- `preflight`: verify CLI + MCP availability.
- `extract-intent`: parse brief/hints into structured intent.
- `gate-intent`: validate intent confidence/ambiguity and behavior preconditions.
- `extract-figma-scope`: parse URL and optionally walk parent scope.
- `gate-figma-scope`: enforce `scopeVerdict` (`sufficient|too_broad|too_narrow|unknown`) with mode (`warn|error`).
- `extract-figma-mcp-tool-logs`: call Figma MCP directly and store raw request/response logs.
- `gate-figma-mcp-tool-logs`: enforce required direct tool-call quality (`off|warn|error`).
- `extract-design-tokens`: normalize tokens from logged MCP evidence (+ agent assistance).
- `gate-design-tokens`: enforce token quality mode (`off|warn|error`).
- `resolve-component-plan`: choose reuse/new target and behavior gate.
- `run-agent-implementation`: implement code changes with injected context docs.
- `gate-changed-paths`: block unrelated file changes.
- `verify`: run quality checks (`lint`, `typecheck`, `test`, `test-storybook`) and Storybook checks.
- `feedback-loop`: on `plan/implement/verify` failure, ask terminal input and retry (max 3 attempts per stage).
- `report`: write run summary JSON.

Default fixed policy:

- `verification` is always `storybook`.
- `require_visual_approval` is always enabled (`--approve-visual` required).
- `figma_mcp_logs_mode` is fixed to `error`.
- `design_tokens_mode` is fixed to `error`.

## Orchestration Diagrams

### Step Ownership Map

| Step                          | Type                 | Primary Runtime                                 |
| ----------------------------- | -------------------- | ----------------------------------------------- |
| `preflight`                   | Gate + Runtime check | Local shell + Agent CLI version/mcp check       |
| `extract-intent`              | Extraction           | Agent CLI                                       |
| `gate-intent`                 | Gate                 | Local code                                      |
| `extract-figma-scope`         | Extraction           | Agent CLI + Figma MCP (conditional)             |
| `gate-figma-scope`            | Gate                 | Local code                                      |
| `extract-figma-mcp-tool-logs` | Extraction           | Local direct MCP HTTP calls                     |
| `gate-figma-mcp-tool-logs`    | Gate                 | Local code                                      |
| `extract-design-tokens`       | Extraction           | Agent CLI (normalization) + logged MCP evidence |
| `gate-design-tokens`          | Gate                 | Local code                                      |
| `resolve-component-plan`      | Planning + Gate      | Local code, optional Agent CLI                  |
| `run-agent-implementation`    | Implementation       | Agent CLI                                       |
| `gate-changed-paths`          | Gate                 | Local git diff                                  |
| `verify`                      | Gate                 | Local `pnpm` checks                             |
| `report`                      | Finalization         | Local filesystem                                |

### Detailed Orchestration Flow

```mermaid
flowchart TD
  A([Start: pnpm ui:run]) --> B[Parse args + read scenario]
  B --> C[Init context + runId]
  C --> D{{preflight}}

  D -- pass --> DI[extract-intent]
  DI --> DG{{gate-intent}}
  DG -- pass/warn --> E[extract-figma-scope]
  DG -- fail --> Z1
  D -- fail --> Z1[write report + fail exit]

  E --> F{{gate-figma-scope}}
  F -- pass/warn --> G0[extract-figma-mcp-tool-logs]
  G0 --> G1{{gate-figma-mcp-tool-logs}}
  G1 -- pass/warn --> G[extract-design-tokens]
  G1 -- fail --> Z1
  F -- fail --> Z1

  G --> H{{gate-design-tokens}}
  H -- pass/warn --> I[resolve-component-plan]
  H -- fail --> Z1

  I --> J{{behavior decision gate<br/>inside resolve-component-plan}}
  J -- confirmed/not-needed --> K[run-agent-implementation]
  J -- missing behavior spec --> Z1

  K --> L{{gate-changed-paths}}
  L -- pass --> O[verify]
  L -- fail --> Z1

  O -- pass --> P[optional open-storybook]
  O -- fail --> Z1
  P --> Q[write report + success exit]

  classDef gate fill:#ffe8cc,stroke:#d9480f,color:#5c2b00;
  classDef agent fill:#e7f5ff,stroke:#1c7ed6,color:#0b3d91;
  classDef local fill:#f4fce3,stroke:#5c940d,color:#2b5a00;
  class D,DG,F,H,J,L,O gate;
  class DI,E,K agent;
  class A,B,C,P,Q,Z1,I local;
```

### Agent vs Tool Sequence

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant R as run.mjs
  participant A as Agent CLI (codex)
  participant M as Figma MCP
  participant G as Git
  participant P as pnpm checks

  U->>R: pnpm ui:run --scenario ...
  R->>R: parseArgs + readScenario + init context
  R->>A: preflight --version

  opt !--skip-mcp-check
    R->>A: preflight mcp get (figma server candidates)
  end

  R->>A: intent-resolve prompt (JSON schema)
  A-->>R: page/componentKind/role/state/confidence

  alt auto_parent && !scope_node_id && !dry-run
    R->>A: figma-scope prompt (JSON schema)
    A->>M: read scope context
    M-->>A: scope evidence
    A-->>R: selectedNodeId/parentChain/scopeVerdict/cannotNarrowFurther
  else no scope extraction agent call
    R->>R: use input node-id directly
  end

  opt !dry-run && figma_mcp_logs_mode != off
    R->>M: initialize / tools/list / tools/call (direct)
    M-->>R: raw MCP responses (logged to artifacts)
  end

  opt !dry-run && design_tokens_mode != off
    R->>A: design-tokens normalization prompt (JSON schema)
    A-->>R: normalized tokens + diagnostics
  end

  R->>A: resolve-component-plan prompt
  A-->>R: action/targetPath/behavior questions

  opt !dry-run
    R->>A: implement prompt (system + task + conventions)
    A-->>R: summary + changedFiles + notes

    R->>G: git diff / ls-files (gate-changed-paths)

    R->>P: lint + typecheck + test + test-storybook (+storybook build if requested)
  end

  opt --open-storybook && !dry-run && verification includes storybook && storybook-static exists
    R->>R: open local storybook index
  end

  R->>R: write report JSON
  R-->>U: pass/fail + report path
```

### Run State Machine

```mermaid
stateDiagram-v2
  [*] --> Initialized
  Initialized --> RunningSteps: runStep(step)

  RunningSteps --> Failed: non-retryable step throws
  RunningSteps --> PlanRetry: resolve-component-plan fail
  PlanRetry --> RunningSteps: user confirms retry (<=3)
  PlanRetry --> Failed: retry declined/exhausted

  RunningSteps --> ImplementRetry: implement/path-gate fail
  ImplementRetry --> RunningSteps: user confirms retry (<=3)
  ImplementRetry --> Failed: retry declined/exhausted

  RunningSteps --> VerifyRetry: verify fail
  VerifyRetry --> RunningSteps: user confirms retry (<=3)
  VerifyRetry --> Failed: retry declined/exhausted
  RunningSteps --> Passed: all steps passed

  Passed --> StorybookOpenAttempt: maybeOpenStorybook()
  Failed --> UsageSummarized: build usage summary

  StorybookOpenAttempt --> UsageSummarized: opened/skipped/failed
  UsageSummarized --> Reported: writeReport()

  Reported --> Finished: print summary + process.exit(code)
  Finished --> [*]
```

### Gate Policy State Machine (`warn` vs `error`)

```mermaid
stateDiagram-v2
  [*] --> Evaluate
  Evaluate --> Skipped: dry-run or mode=off
  Evaluate --> Passed: status=ok
  Evaluate --> Warned: status!=ok and mode=warn
  Evaluate --> Failed: status!=ok and mode=error
  Skipped --> [*]
  Passed --> [*]
  Warned --> [*]
  Failed --> [*]
```

## Scenario Shape (Minimal)

```yaml
brief: 'Favorite toast on image result page, success state'

figma:
  url: 'https://www.figma.com/design/.../TEMP?node-id=1-427&m=dev'
```

## Scenario Keys

- `brief`: required natural-language context for intent extraction
- `intent.page|component_kind|role|state|notes`: optional hints for stable intent resolution
- `behavior.confirmed`: set `true` when creating a new interactive component with explicit behavior
- `behavior.spec`: behavior contract text (required if `behavior.confirmed=true`)
- `gates.intent_mode`: intent gate strictness (`warn|error`, default `error`)
- `gates.intent_min_confidence`: minimum intent confidence (`0.0~1.0`, default `0.75`)
- `gates.scope_gate_mode`: scope gate strictness (`warn|error`, default `warn`)
- `figma.mcp_endpoint`: direct MCP endpoint for raw tool logging (default: `https://mcp.figma.com/mcp`)
- `figma.mcp_auth_token_env`: env var name for remote MCP bearer token (example: `FIGMA_MCP_ACCESS_TOKEN`)
- `gates.allowed_changed_paths`: explicit allowed change paths

## Behavior Decision Gate

- If a similar existing component is found, pipeline follows the existing behavior pattern.
- If no similar component exists and the planned target is interaction-heavy, pipeline stops and asks for explicit behavior confirmation in scenario.

## Notes

- Prompt files in `prompts/` are explicitly injected by `ui:run`.
- Agent runtime is fixed to Codex (`codexf` preferred, fallback to `codex`).
- Baseline UI rule docs are always injected: `docs/reference/ui-component-design-conventions.md`, `docs/reference/styling-system.md`, `docs/reference/component-catalog.md`.
- Per-agent prompt/stdout/stderr/parsed JSON are saved in `artifacts/<runId>/agent-trace/`.
- Direct Figma MCP request/response logs are saved under `artifacts/<runId>/figma-mcp-raw/`.
- For remote MCP, set a bearer token env (`FIGMA_MCP_ACCESS_TOKEN` by default, or custom via `figma.mcp_auth_token_env`).
- Run report includes `figmaMcpToolUsage` and `agentTokenUsage` summaries.
- `reports/index.jsonl` is auto-generated every run for quick team summary.
- Auto cleanup runs every execution: keep only recent 7 days or recent 10 runs (reports + linked artifacts).
- Use `--open-storybook` to open `storybook-static/index.html` after a successful run.
