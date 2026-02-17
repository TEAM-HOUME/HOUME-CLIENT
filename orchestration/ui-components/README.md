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

- `preflight`: verify required CLI availability, codex runtime, and direct Figma MCP probe (`initialize` + `tools/list` + required tools).
- `extract-intent`: resolve structured intent from brief/hints + docs conventions + retry context.
- `gate-intent`: validate confidence/fields and split ambiguities into `blocking` vs `advisory`.
- `extract-figma-scope`: parse URL and optionally walk parent scope.
- `gate-figma-scope`: enforce `scopeVerdict` (`sufficient|too_broad|too_narrow|unknown`) with mode (`warn|error`).
- `extract-figma-mcp-tool-logs`: call Figma MCP directly and store raw request/response logs.
- `gate-figma-mcp-tool-logs`: enforce required direct tool-call quality (`off|warn|error`).
- `extract-design-tokens`: normalize tokens from logged MCP evidence (+ agent assistance).
- `gate-design-tokens`: enforce token quality mode (`off|warn|error`).
- `extract-figma-asset-scope`: probe child node contexts from selected scope to recover icon/image/vector hints.
- `gate-figma-asset-coverage`: compare screenshot evidence vs extracted context and block on likely graphic-asset miss.
- `resolve-component-plan`: choose reuse/new target and behavior gate.
- `run-agent-implementation`: implement code changes with system prompt + task context + docs conventions.
- `gate-changed-paths`: block unrelated file changes.
- `verify`: run quality checks (`lint`, `typecheck`, `test`) and Storybook checks. (`test-storybook` is temporarily excluded)
- `feedback-loop`: on `intent/asset/plan/implement/verify` failure, ask terminal input and retry (max 10 attempts per stage).
- If input is unavailable (non-interactive tty), feedback-loop fails fast without auto-retry.
- `report`: write run summary JSON.

Default fixed policy:

- `verification` is always `storybook`.
- `require_visual_approval` is always enabled (`--approve-visual` required).
- `figma_mcp_logs_mode` is fixed to `error`.
- `design_tokens_mode` is fixed to `error`.

## Context Injection Matrix

| Stage                       | Prompt Source                                 | Injected Context                                                                                                                      | Output Artifact                                                     |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `preflight`                 | None (local check)                            | required commands, codex runtime, `figma.mcp_endpoint`, MCP `initialize/tools/list` probe                                             | runtime summary only                                                |
| `extract-intent`            | Inline prompt in step code                    | `brief`, `intent hints`, `feedbackLoop.intent`, `intentOverrides`, `docs/reference/*` conventions                                     | `artifacts/*-intent.json`, `agent-trace/*-intent-resolve.*`         |
| `resolve-component-plan`    | Inline prompt in step code                    | resolved intent, design context/token artifact paths, docs convention sources, `feedbackLoop.plan`                                    | in-memory `componentPlan`, `agent-trace/*-resolve-component-plan.*` |
| `run-agent-implementation`  | `prompts/codex.system.md` + inline task block | resolved intent, plan, design context/token artifacts, full docs convention content, `feedbackLoop.implement`, `feedbackLoop.verify`  | code changes + `agent-trace/*-implement.*`                          |
| `extract-design-tokens`     | Inline prompt in step code                    | direct MCP log artifact path + direct tool records (`figmaMcpDirectToolRecords`)                                                      | `artifacts/*-design-tokens.json`                                    |
| `extract-figma-asset-scope` | Local direct MCP probe                        | selected node `get_design_context` output + child node-id inference + direct MCP probe (`get_design_context`) + `assetProbeOverrides` | `artifacts/*-figma-asset-scope.json`                                |
| `gate-figma-asset-coverage` | Inline prompt in step code                    | direct MCP logs + asset-scope artifact + screenshot/context consistency rules + `feedbackLoop.asset` retry notes                      | `artifacts/*-figma-asset-coverage.json`                             |
| `report`                    | None (local serialization)                    | step logs, warnings, `feedbackHistory`, token usage, artifact paths, `intentOverrides`, `assetProbeOverrides`                         | `reports/<runId>.json`, `reports/index.jsonl`                       |

## Orchestration Diagrams

### Step Ownership Map

| Step                          | Type                 | Primary Runtime                                    |
| ----------------------------- | -------------------- | -------------------------------------------------- |
| `preflight`                   | Gate + Runtime check | Local shell + Agent CLI version + direct MCP probe |
| `extract-intent`              | Extraction           | Agent CLI                                          |
| `gate-intent`                 | Gate                 | Local code                                         |
| `extract-figma-scope`         | Extraction           | Agent CLI + Figma MCP (conditional)                |
| `gate-figma-scope`            | Gate                 | Local code                                         |
| `extract-figma-mcp-tool-logs` | Extraction           | Local direct MCP HTTP calls                        |
| `gate-figma-mcp-tool-logs`    | Gate                 | Local code                                         |
| `extract-design-tokens`       | Extraction           | Agent CLI (normalization) + logged MCP evidence    |
| `gate-design-tokens`          | Gate                 | Local code                                         |
| `extract-figma-asset-scope`   | Extraction           | Local direct MCP HTTP calls                        |
| `gate-figma-asset-coverage`   | Gate                 | Agent CLI + Local gate policy                      |
| `resolve-component-plan`      | Planning + Gate      | Agent CLI + local behavior guard                   |
| `run-agent-implementation`    | Implementation       | Agent CLI                                          |
| `gate-changed-paths`          | Gate                 | Local git diff                                     |
| `verify`                      | Gate                 | Local `pnpm` checks                                |
| `report`                      | Finalization         | Local filesystem                                   |

### Detailed Orchestration Flow

```mermaid
flowchart TD
  A([Start: pnpm ui:run]) --> B[Parse args + read scenario]
  B --> C[Init context + runId]
  C --> D{{preflight}}

  D -- fail --> Z1[write report + fail exit]
  D -- pass --> DI[extract-intent]
  DI --> DG{{gate-intent}}
  DG -- fail --> DR[feedback: intent retry + structured overrides]
  DR --> DI
  DG -- pass/ok_with_advisory --> E[extract-figma-scope]

  E --> F{{gate-figma-scope}}
  F -- pass/warn --> G0[extract-figma-mcp-tool-logs]
  G0 --> G1{{gate-figma-mcp-tool-logs}}
  G1 -- pass/warn --> G[extract-design-tokens]
  G1 -- fail --> Z1
  F -- fail --> Z1

  G --> H{{gate-design-tokens}}
  H -- fail --> Z1
  H -- pass/warn --> HA[extract-figma-asset-scope]
  HA --> HB{{gate-figma-asset-coverage}}
  HB -- fail --> HR[feedback: asset retry + structured overrides]
  HR --> HA
  HB -- pass/warn --> I[resolve-component-plan]

  I -- fail --> IR[feedback: plan retry]
  IR --> I
  I -- pass --> K[run-agent-implementation]

  K --> L{{gate-changed-paths}}
  L -- fail --> KR[feedback: implement/path retry]
  KR --> K
  L -- pass --> O[verify]

  O -- fail --> VR[feedback: verify retry]
  VR --> K
  O -- pass --> P[optional open-storybook]
  P --> Q[write report + success exit]

  classDef gate fill:#ffe8cc,stroke:#d9480f,color:#5c2b00;
  classDef agent fill:#e7f5ff,stroke:#1c7ed6,color:#0b3d91;
  classDef local fill:#f4fce3,stroke:#5c940d,color:#2b5a00;
  class D,DG,F,H,HB,L,O gate;
  class DI,E,K agent;
  class A,B,C,P,Q,Z1,I,DR,HR,IR,KR,VR local;
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
  R->>M: preflight initialize + tools/list (direct)
  M-->>R: endpoint/tools health

  R->>A: intent-resolve prompt (brief + hints + docs + feedback + overrides)
  A-->>R: page/componentKind/role/state/confidence
  R->>R: gate-intent (blocking/advisory split)

  alt gate-intent blocked
    R->>U: retry prompt (y/n + structured choices + extra prompt)
    U-->>R: override decisions
    R->>A: intent-resolve retry with merged overrides
    A-->>R: refined intent
  end

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

  opt !dry-run && figma.asset_probe_enabled=true
    R->>M: child asset probe (get_design_context on inferred child node ids)
    M-->>R: child asset context evidence
    R->>A: asset coverage gate (screenshot/context consistency)
    A-->>R: covered/missing/unknown + rationale
    alt asset gate blocked
      R->>U: retry prompt (y/n + asset structured overrides)
      U-->>R: optional node ids + probe configs + mode
      R->>M: child asset probe retry
      R->>A: asset coverage gate retry
    end
  end

  R->>A: resolve-component-plan prompt (intent + artifacts + docs sources + plan feedback)
  A-->>R: action/targetPath/behavior questions

  opt !dry-run
    R->>A: implement prompt (codex.system.md + task + docs + feedback)
    A-->>R: summary + changedFiles + notes

    R->>G: git diff / ls-files (gate-changed-paths)

    R->>P: lint + typecheck + test (+storybook build if requested)
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

  RunningSteps --> Failed: preflight/scope/token/non-retryable fail
  RunningSteps --> IntentRetry: extract-intent or gate-intent fail
  IntentRetry --> RunningSteps: user confirms retry (<=10)
  IntentRetry --> Failed: retry declined/exhausted

  RunningSteps --> AssetRetry: asset-scope or asset-coverage fail
  AssetRetry --> RunningSteps: user confirms retry (<=10)
  AssetRetry --> Failed: retry declined/exhausted

  RunningSteps --> PlanRetry: resolve-component-plan fail
  PlanRetry --> RunningSteps: user confirms retry (<=10)
  PlanRetry --> Failed: retry declined/exhausted

  RunningSteps --> ImplementRetry: implement/path-gate fail
  ImplementRetry --> RunningSteps: user confirms retry (<=10)
  ImplementRetry --> Failed: retry declined/exhausted

  RunningSteps --> VerifyRetry: verify fail
  VerifyRetry --> RunningSteps: user confirms retry (<=10)
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
- `gates.asset_coverage_mode`: screenshot/context asset coverage strictness (`off|warn|error`, default `error`)
- `figma.mcp_endpoint`: direct MCP endpoint for preflight/logging/capture (default: `http://127.0.0.1:3845/mcp`)
- `figma.mcp_auth_token_env`: env var name for remote MCP bearer token (example: `FIGMA_MCP_ACCESS_TOKEN`)
- `figma.auto_parent`: if `true`, scope extraction agent can walk parent chain (`default: true`)
- `figma.parent_hops_max`: maximum parent hops during auto scope selection (`default: 3`)
- `figma.scope_node_id`: explicit scope override to skip agent scope walk
- `figma.asset_probe_enabled`: enable child asset probe stage (`default: true`)
- `figma.asset_probe_max_candidates`: max inferred child node ids to probe (`default: 8`)
- `figma.asset_probe_timeout_ms`: timeout per child probe call (`default: figma.timeout_ms`)
- `gates.allowed_changed_paths`: explicit allowed change paths

## Scope Gate Behavior

- Gate verdict enum is fixed: `sufficient|too_broad|too_narrow|unknown`.
- `sufficient` always passes.
- `too_broad` with `cannotNarrowFurther=true` passes with warning (to avoid false-fail at parent-hop limit).
- `too_broad|too_narrow|unknown` follow `gates.scope_gate_mode`:
  - `error`: fail the run.
  - `warn`: continue with warning.
- If scope selection is unstable, prefer setting `figma.scope_node_id` explicitly.

## Behavior Decision Gate

- If a similar existing component is found, pipeline follows the existing behavior pattern.
- If no similar component exists and the planned target is interaction-heavy, pipeline stops and asks for explicit behavior confirmation in scenario.

## Notes

- Prompt files in `prompts/` are explicitly injected by `ui:run`.
- Agent runtime is fixed to Codex (`codexf` preferred, fallback to `codex`).
- Codex invocation pins model/runtime overrides: `-m gpt-5.3-codex` and `-c model_reasoning_effort="medium"`.
- Baseline UI rule docs are always injected: `docs/reference/ui-component-design-conventions.md`, `docs/reference/styling-system.md`, `docs/reference/component-catalog.md`.
- Per-agent prompt/stdout/stderr/parsed JSON are saved in `artifacts/<runId>/agent-trace/`.
- Direct Figma MCP request/response logs are saved under `artifacts/<runId>/figma-mcp-raw/`.
- For remote MCP endpoint, set a bearer token env (`FIGMA_MCP_ACCESS_TOKEN` by default, or custom via `figma.mcp_auth_token_env`).
- Run report includes `figmaMcpToolUsage` and `agentTokenUsage` summaries.
- `reports/index.jsonl` is auto-generated every run for quick team summary.
- Auto cleanup runs every execution: keep only recent 7 days or recent 10 runs (reports + linked artifacts).
- Run report JSON includes `feedbackHistory` (retry question prompts + raw user answers).
- Run report JSON includes `intentOverrides` (structured user decisions from intent retry loop).
- Run report JSON includes `assetProbeOverrides` (structured user decisions from asset retry loop).
- Run report JSON includes `figmaAssetScopeArtifactPath` and `figmaAssetCoverageArtifactPath`.
- Use `--open-storybook` to open `storybook-static/index.html` after a successful run.
