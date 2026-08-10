import {
  interactionDurationValues,
  interactionVars,
} from '@styles/tokens/interaction/tokens.css';

export type InteractionDuration =
  keyof typeof interactionVars.interaction.duration;

export type InteractionEasing = keyof typeof interactionVars.interaction.easing;

export type InteractionTrigger =
  keyof typeof interactionVars.interaction.trigger;

export type InteractionAction = keyof typeof interactionVars.interaction.action;

/**
 * Figma 인터랙션 스펙 — trigger / action / duration / easing / property
 * property는 CSS transition-property (예: transform, opacity, height)
 */
export interface InteractionSpec {
  trigger: InteractionTrigger;
  action: InteractionAction;
  duration: InteractionDuration;
  easing: InteractionEasing;
  property: string;
}

/**
 * Figma 스펙 → CSS transition 문자열
 *
 * 공통 스펙은 `@styles/tokens/interaction/presets` 참고.
 * 컴포넌트 전용 스펙만 여기서 `interaction()` 호출.
 *
 * @example
 * import { pressInteraction } from '@styles/tokens/interaction/presets';
 * // ...pressInteraction(0.95) => transition + :active scale
 */
export const interaction = (spec: InteractionSpec): string =>
  transition(spec.property, spec.duration, spec.easing);

export const interactionDurationMs = (spec: InteractionSpec): number =>
  interactionDurationValues[spec.duration];

export const interactionEasing = (spec: InteractionSpec): string =>
  interactionVars.interaction.easing[spec.easing];

/**
 * CSS transition 단일 속성 문자열 생성
 *
 * @example
 * transition('opacity', 'base', 'bezier.out')
 * // => 'opacity 400ms cubic-bezier(0, 0.56, 0.33, 1)'
 */
export const transition = (
  property: string,
  duration: InteractionDuration = 'base',
  easing: InteractionEasing = 'bezier.out'
): string =>
  `${property} ${interactionVars.interaction.duration[duration]} ${interactionVars.interaction.easing[easing]}`;
