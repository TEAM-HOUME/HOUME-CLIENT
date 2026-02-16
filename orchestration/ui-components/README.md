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
  - `artifacts/<runId>/agent-trace/`: per-agent prompt/stdout/stderr/parsed JSON.

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
- `gate-story-design-links`: 변경된 `*.stories.*` 파일에 `parameters.design.url` 존재 여부 강제.
- `extract-code-connect-map`: Figma MCP 기반 Code Connect 매핑 추출 후 artifact 저장.
- `gate-code-connect`: Code Connect 매핑 경로와 시나리오 타깃 경로 정합성 게이트.
- `agent-trace`: 각 에이전트 호출별 원본 prompt/stdout/stderr/파싱 결과를 artifact로 저장.
- `gate-changed-paths`: 시나리오에 정의한 허용 경로 밖 파일 변경 시 실패.
- `verify`: `lint/typecheck/test/test-storybook`를 기본 강제 실행하고 viewport 규칙 검증.
- `report`: 실행 결과를 `reports/*.json`으로 기록.

## Options

- `--dry-run`: 에이전트 수정/검증을 생략하고 계획 단계까지만 실행.
- `--approve-visual`: Storybook 시각 검증 수동 확인을 승인.
- `--skip-mcp-check`: MCP 등록 확인 단계를 건너뜀.
- `--open-storybook`: 성공 시 `storybook-static/index.html`을 자동으로 엽니다.

## Scenario Keys

- `agent.command`: 기본 CLI 대신 사용할 실행 명령 (예: `codexf` alias).
- `agent.args`: `agent.command` 앞단에 붙일 공통 인자 리스트.
- `figma.timeout_ms`: Figma 컨텍스트 추출 단계 타임아웃.
- `gates.require_visual_approval`: Storybook 검증 후 수동 승인 강제 여부.
- `gates.require_story_design_url`: 변경된 Story 파일의 `parameters.design.url` 강제 여부.
- `gates.code_connect_mode`: `off|warn|error` (`warn` 권장).
- `gates.allowed_changed_paths`: 구현 단계에서 허용하는 변경 파일 경로(glob).

## Notes

- Prompt files in `prompts/` are explicitly injected by `ui:run`, not auto-loaded by CLI defaults.
- Scenario report (`reports/*.json`) includes `agentTraceArtifacts` with relative paths to trace files.
- CLI 출력은 단계별 `시작/통과/실패`와 핵심 요약(변경 파일 수, 매핑 수, 검증 개수)을 함께 표시합니다.
