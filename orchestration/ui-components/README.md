# UI Components Orchestration

This directory stores reproducible inputs and constraints for design-to-code UI work.

## Goal

- Single entry flow for component implementation from a design node URL.
- Fail fast if the required local environment is missing.
- Keep outputs traceable with scenario-based execution.

## Directory Layout

- `scenarios/`: task input files with design URL and target components.
- `contracts/`: implementation constraints and component ownership map.
- `prompts/`: shared system prompt snippets for each coding agent.
- `reports/`: execution reports (kept local by default).
- `artifacts/`: temporary outputs (kept local by default).

## Run

```bash
pnpm ui:run --scenario orchestration/ui-components/scenarios/jjym-toast.yml
```

## Notes

- This is an initial scaffold. Step executors and CI gating are added next.
