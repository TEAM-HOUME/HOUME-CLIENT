import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animationType?:
    | 'fadeInUp'
    | 'fadeIn'
    | 'slideInLeft'
    | 'slideInRight'
    | 'scaleUp';
  delay?: number;
  duration?: number;
}

export const AnimatedSection = forwardRef<HTMLDivElement, AnimatedSectionProps>(
  (
    {
      children,
      className = '',
      animationType = 'fadeInUp',
      delay = 0,
      duration = 1000,
    },
    forwardedRef
  ) => {
    const { ref, isVisible } = useScrollAnimation({
      threshold: 0.2,
      triggerOnce: true,
    });

    // forwardedRef가 있으면 사용하고, 없으면 내부 ref 사용
    const elementRef = forwardedRef || ref;

    return (
      <div
        ref={elementRef}
        className={className}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: getTransform(animationType, isVisible),
          transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </div>
    );
  }
);

const getTransform = (type: string, isVisible: boolean) => {
  if (isVisible) return 'translateY(0) translateX(0) scale(1)';

  switch (type) {
    case 'fadeInUp':
      return 'translateY(60px) scale(0.9)';
    case 'fadeIn':
      return 'scale(0.8)';
    case 'slideInLeft':
      return 'translateX(-60px) scale(0.9)';
    case 'slideInRight':
      return 'translateX(60px) scale(0.9)';
    case 'scaleUp':
      return 'scale(0.7) translateY(40px)';
    default:
      return 'translateY(60px) scale(0.9)';
  }
};
