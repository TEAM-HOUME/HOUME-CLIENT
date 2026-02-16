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
- Use `--open-storybook` to open `storybook-static/index.html` after a successful run.
