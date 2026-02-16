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

## Pipeline Stages

- `preflight`: CLI/MCP 환경 확인, 미설정 시 즉시 실패.
- `extract-figma-scope`: 디자인 URL 파싱, 필요 시 상위 노드 자동 스코프 분석.
  결과를 `artifacts/<runId>-design-context.json`으로 고정 저장.
- `resolve-component-plan`: `component-map` + 프로젝트 파일 상태로 `update/create` 결정.
- `run-agent-implementation`: Codex/Claude 헤드리스 실행으로 컴포넌트 수정.
- `gate-changed-paths`: 시나리오에 정의한 허용 경로 밖 파일 변경 시 실패.
- `verify`: lint/test/typecheck/storybook 및 viewport 규칙 검증.
- `report`: 실행 결과를 `reports/*.json`으로 기록.

## Options

- `--dry-run`: 에이전트 수정/검증을 생략하고 계획 단계까지만 실행.
- `--approve-visual`: Storybook 시각 검증 수동 확인을 승인.
- `--skip-mcp-check`: MCP 등록 확인 단계를 건너뜀.

## Scenario Keys

- `agent.command`: 기본 CLI 대신 사용할 실행 명령 (예: `codexf` alias).
- `agent.args`: `agent.command` 앞단에 붙일 공통 인자 리스트.
- `figma.timeout_ms`: Figma 컨텍스트 추출 단계 타임아웃.
- `gates.require_visual_approval`: Storybook 검증 후 수동 승인 강제 여부.
- `gates.allowed_changed_paths`: 구현 단계에서 허용하는 변경 파일 경로(glob).

## Notes

- Prompt files in `prompts/` are explicitly injected by `ui:run`, not auto-loaded by CLI defaults.
