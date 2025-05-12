import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface FooterProps {
  onAnimationComplete?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAnimationComplete }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSpanRef = useRef<HTMLSpanElement>(null);
  const rightSpanRef = useRef<HTMLSpanElement>(null);

  const handleAnimationComplete = useCallback(() => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  }, [onAnimationComplete]);

  useEffect(() => {
    const leftSpan = leftSpanRef.current;
    const rightSpan = rightSpanRef.current;
    const container = contentRef.current;

    if (container && leftSpan && rightSpan) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const smallScreenWidth = 1024;

      gsap.fromTo(
        container,
        { opacity: 0, y: 20, x: -container.offsetWidth / 2, position: 'absolute', top: viewportHeight / 2, left: viewportWidth / 2, transform: 'translate(-50%, -50%)', duration: 3, ease: 'power2.out' },
        {
          opacity: 1,
          y: 0,
          x: -container.offsetWidth / 2, // Maintain horizontal centering
          top: viewportHeight / 2,
          left: viewportWidth / 2,
          transform: 'translate(-50%, -50%)',
          duration: 2,
          ease: 'power2.out',
          delay: 1.5,
          onComplete: () => {
            const tl = gsap.timeline({ onComplete: handleAnimationComplete });
            const leftSpanWidth = leftSpan.offsetWidth || 0;
            const rightSpanWidth = rightSpan.offsetWidth || 0;
            const leftSpanHeight = leftSpan.offsetHeight || 0;
            const rightSpanHeight = rightSpan.offsetHeight || 0;

            if (viewportWidth > smallScreenWidth) {
              tl.to(
                [leftSpan, rightSpan],
                {
                  x: (index) =>
                    index === 0
                      ? -(viewportWidth / 2.4 - leftSpanWidth / 2.5)
                      : viewportWidth / 2.4 - rightSpanWidth / 2.5,
                  duration: 1.5,
                  ease: 'power4.inOut',
                }
              );
            }

            tl.to(
              [leftSpan, rightSpan],
              {
                y: (index: number) =>
                  index === 0
                    ? viewportHeight / 2.1 - leftSpanHeight
                    : viewportHeight / 2.1 - rightSpanHeight,
                duration: 2,
                delay: viewportWidth <= smallScreenWidth ? 0 : 1.5, // Adjust delay for smaller screens
                ease: 'power4.inOut',
              }
            ).to(
              [leftSpan, rightSpan],
              {
                x: 0,
                duration: 1.5,
                ease: 'power4.inOut',
              }
            );
          },
        }
      );
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
      <div ref={contentRef} className="text-center relative">
        <div className={`flex items-center justify-center text-sm`}>
          <span ref={leftSpanRef} className="p-0.5 whitespace-nowrap">
            Just an ordinary DEVELOPER.
          </span>
          <span ref={rightSpanRef} className="p-0.5 whitespace-nowrap">
            From INDIA with pride
          </span>
        </div>
      </div>
    </div>
  );
};