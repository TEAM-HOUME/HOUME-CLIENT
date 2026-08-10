import { createGlobalTheme } from '@vanilla-extract/css';

/**
 * 디자인 토큰 V2 - Interaction
 *
 * Figma InteractionToken 스코프
 * - duration: 애니메이션 전체 소요 시간
 * - easing: 애니메이션 속도 변화 곡선 (cubic-bezier)
 * - trigger: 인터랙션 시작 조건 (식별자)
 * - action: 인터랙션 결과 동작 (식별자)
 */

/** JS 타이머/keyframes용 ms 원본값 (createGlobalTheme 값은 var() 참조라 parse 불가) */
export const interactionDurationValues = {
  instant: 0,
  fastest: 150,
  fast: 250,
  base: 400,
  slow: 600,
  slower: 800,
  slowest: 1200,
} as const;

export const interactionVars = createGlobalTheme(':root', {
  interaction: {
    duration: {
      instant: `${interactionDurationValues.instant}ms`,
      fastest: `${interactionDurationValues.fastest}ms`,
      fast: `${interactionDurationValues.fast}ms`,
      base: `${interactionDurationValues.base}ms`,
      slow: `${interactionDurationValues.slow}ms`,
      slower: `${interactionDurationValues.slower}ms`,
      slowest: `${interactionDurationValues.slowest}ms`,
    },
    easing: {
      'bezier.out': 'cubic-bezier(0, 0.56, 0.33, 1)',
      'bezier.inout': 'cubic-bezier(0.59, 0.14, 0.38, 1)',
      'bezier.back': 'cubic-bezier(0.25, 1.45, 0.65, 1.03)',
    },
    trigger: {
      tap: 'tap',
      whilePressing: 'whilePressing',
      mouseUp: 'mouseUp',
      afterDelay: 'afterDelay',
    },
    action: {
      stateChange: 'stateChange',
      'motion.fadeIn': 'motion.fadeIn',
      'motion.fadeOut': 'motion.fadeOut',
      'motion.slideIn': 'motion.slideIn',
      'motion.slideOut': 'motion.slideOut',
      'motion.move': 'motion.move',
    },
  },
});
