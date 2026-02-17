# UI Components Orchestration

Single-command pipeline for turning a Figma node into a validated UI component change.

## Goal

- Keep design-to-code flow reproducible.
- Fail fast when local CLI/MCP prerequisites are missing.
- Apply project UI conventions from `docs/` instead of hard-coded component maps.

## Directory Layout

- `scenarios/`: scenario inputs (`.yml`)
- `prompts/`: system prompt fragments for Codex/Claude
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
- `extract-figma-scope`: parse URL and optionally walk parent scope.
- `gate-figma-scope`: fail when selected scope is still too broad.
- `extract-design-tokens`: capture raw MCP evidence + normalized tokens.
- `gate-design-tokens`: enforce token quality mode (`off|warn|error`).
- `resolve-component-plan`: choose reuse/new target and behavior gate.
- `run-agent-implementation`: implement code changes with injected context docs.
- `gate-changed-paths`: block unrelated file changes.
- `extract-code-connect-map`: collect Code Connect mapping evidence.
- `gate-code-connect`: compare mapping paths with planned target.
- `verify`: run quality checks (`lint`, `typecheck`, `test`, `test-storybook`) and Storybook checks.
- `report`: write run summary JSON.

## Orchestration Diagrams

### Step Ownership Map

| Step                       | Type                 | Primary Runtime                           |
| -------------------------- | -------------------- | ----------------------------------------- |
| `preflight`                | Gate + Runtime check | Local shell + Agent CLI version/mcp check |
| `extract-figma-scope`      | Extraction           | Agent CLI + Figma MCP (conditional)       |
| `gate-figma-scope`         | Gate                 | Local code                                |
| `extract-design-tokens`    | Extraction           | Agent CLI + Figma MCP                     |
| `gate-design-tokens`       | Gate                 | Local code                                |
| `resolve-component-plan`   | Planning + Gate      | Local code, optional Agent CLI            |
| `run-agent-implementation` | Implementation       | Agent CLI                                 |
| `gate-changed-paths`       | Gate                 | Local git diff                            |
| `extract-code-connect-map` | Extraction           | Agent CLI + Figma MCP                     |
| `gate-code-connect`        | Gate                 | Local code                                |
| `verify`                   | Gate                 | Local `pnpm` checks                       |
| `report`                   | Finalization         | Local filesystem                          |

### Detailed Orchestration Flow

```mermaid
flowchart TD
  A([Start: pnpm ui:run]) --> B[Parse args + read scenario]
  B --> C[Init context + runId]
  C --> D{{preflight}}

  D -- pass --> E[extract-figma-scope]
  D -- fail --> Z1[write report + fail exit]

  E --> F{{gate-figma-scope}}
  F -- pass/warn --> G[extract-design-tokens]
  F -- fail --> Z1

  G --> H{{gate-design-tokens}}
  H -- pass/warn --> I[resolve-component-plan]
  H -- fail --> Z1

  I --> J{{behavior decision gate<br/>inside resolve-component-plan}}
  J -- confirmed/not-needed --> K[run-agent-implementation]
  J -- missing behavior spec --> Z1

  K --> L{{gate-changed-paths}}
  L -- pass --> M[extract-code-connect-map]
  L -- fail --> Z1

  M --> N{{gate-code-connect}}
  N -- pass/warn --> O[verify]
  N -- fail --> Z1

  O -- pass --> P[optional open-storybook]
  O -- fail --> Z1
  P --> Q[write report + success exit]

  classDef gate fill:#ffe8cc,stroke:#d9480f,color:#5c2b00;
  classDef agent fill:#e7f5ff,stroke:#1c7ed6,color:#0b3d91;
  classDef local fill:#f4fce3,stroke:#5c940d,color:#2b5a00;
  class D,F,H,J,L,N,O gate;
  class E,G,K,M agent;
  class A,B,C,P,Q,Z1,I local;
```

### Agent vs Tool Sequence

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant R as run.mjs
  participant A as Agent CLI (codex/claude)
  participant M as Figma MCP
  participant G as Git
  participant P as pnpm checks

  U->>R: pnpm ui:run --scenario ...
  R->>R: parseArgs + readScenario + init context
  R->>A: preflight (--version, mcp get)

  alt auto_parent && !scope_node_id && !dry-run
    R->>A: figma-scope prompt (JSON schema)
    A->>M: read scope context
    M-->>A: scope evidence
    A-->>R: selectedNodeId/parentChain/isNarrow
  else no scope extraction agent call
    R->>R: use input node-id directly
  end

  R->>A: design-tokens prompt (JSON schema)
  A->>M: get_design_context / get_variable_defs / get_metadata / get_screenshot
  M-->>A: raw token evidence
  A-->>R: normalized tokens + diagnostics

  opt target unresolved
    R->>A: resolve-component-plan prompt
    A-->>R: action/targetPath/behavior questions
  end

  R->>A: implement prompt (system + task + conventions)
  A-->>R: summary + changedFiles + notes

  R->>G: git diff / ls-files (gate-changed-paths)

  R->>A: code-connect-map prompt
  A->>M: code connect lookup
  M-->>A: mapping evidence
  A-->>R: mapping list + status

  R->>P: lint + typecheck + test + test-storybook (+storybook build if requested)
  R->>R: write report JSON
  R-->>U: pass/fail + report path
```

### Run State Machine

```mermaid
stateDiagram-v2
  [*] --> Initialized
  Initialized --> RunningStep: runStep(step)

  RunningStep --> StepPassed: handler returns
  RunningStep --> StepFailed: handler throws

  StepPassed --> RunningStep: next step exists
  StepPassed --> Completed: all steps passed

  StepFailed --> Reported: writeReport + exitCode=1
  Completed --> Reported: writeReport + exitCode=0

  Reported --> StorybookOpened: --open-storybook and build exists
  Reported --> Finished: storybook open skipped/failed
  StorybookOpened --> Finished
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
id: jjym-toast

figma:
  url: 'https://www.figma.com/design/.../TEMP?node-id=1-427&m=dev'

agent:
  engine: codex
```

## Scenario Keys (Optional)

- `target`: explicit single target file path (preferred for deterministic updates)
- `targets`: legacy list form; only one target is supported in automatic planning
- `context.ui_rules_docs`: docs to inject as coding conventions
- `behavior.confirmed`: set `true` when creating a new interactive component with explicit behavior
- `behavior.spec`: behavior contract text (required if `behavior.confirmed=true`)
- `gates.design_tokens_mode`: `off|warn|error`
- `gates.code_connect_mode`: `off|warn|error`
- `gates.allowed_changed_paths`: explicit allowed change paths
- `gates.require_visual_approval`: require `--approve-visual` when Storybook verification is enabled

## Behavior Decision Gate

- If a similar existing component is found, pipeline follows the existing behavior pattern.
- If no similar component exists and the planned target is interaction-heavy, pipeline stops and asks for explicit behavior confirmation in scenario.

## Notes

- Prompt files in `prompts/` are explicitly injected by `ui:run`.
- Per-agent prompt/stdout/stderr/parsed JSON are saved in `artifacts/<runId>/agent-trace/`.
- Run report includes `figmaMcpToolUsage` and `agentTokenUsage` summaries.
- Use `--open-storybook` to open `storybook-static/index.html` after a successful run.
