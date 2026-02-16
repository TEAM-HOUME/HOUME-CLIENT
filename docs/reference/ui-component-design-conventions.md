# UI Component Design Conventions

This document is consumed by `orchestration/ui-components` as implementation context.
Agents must follow these conventions when translating Figma design nodes into code.

## Responsive Layout

- Keep width fluid; do not hard-code width to a single Figma frame width.
- Preserve fixed height only when the design explicitly defines a fixed-height surface.
- Prefer a mobile-first range aligned with the app shell (`375px` to `440px`).
- Use internal spacing tokens and existing layout variables before introducing new constants.

## Reuse Policy

- Reuse existing components first.
- If an existing component with similar behavior exists, follow that behavior and structure.
- Create a new component only when no suitable existing component can be safely reused.

## Interaction Policy

- For interaction-heavy components (modal, bottom sheet, dialog, drawer, popover):
  - If a similar existing component exists, follow the existing interaction pattern.
  - If no similar component exists, require explicit behavior confirmation before implementation.

## Storybook Policy

required_storybook_viewports:

- mobile375
- mobile440
