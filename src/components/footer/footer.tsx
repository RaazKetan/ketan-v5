import React, { useEffect, useRef} from 'react';
import gsap from 'gsap';

export const Footer: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSpanRef = useRef<HTMLSpanElement>(null);
  const rightSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const leftSpan = leftSpanRef.current;
    const rightSpan = rightSpanRef.current;
    const container = contentRef.current;

    if (container && leftSpan && rightSpan) {
      gsap.fromTo(
        container,
        { opacity: 0, y: 20, duration: 3, ease: 'power2.out' },
        {
          opacity: 1,
          y: 0,
          duration: 2,
          ease: 'power2.out',
          delay: 1.5,
          onComplete: () => {
            const tl = gsap.timeline();
            const leftSpanWidth = leftSpan.offsetWidth || 0;
            const rightSpanWidth = rightSpan.offsetWidth || 0;
            const leftSpanHeight = leftSpan.offsetHeight || 0;
            const rightSpanHeight = rightSpan.offsetHeight || 0;
            const containerHeight = container.offsetHeight || 0;
            tl.to(
              [leftSpan, rightSpan],
              {
                x: (index) =>
                  index === 0
                    ? -(container.offsetWidth / 2.4 - leftSpanWidth / 2.5)
                    : container.offsetWidth / 2.4 - rightSpanWidth / 2.5,
                duration: 1.5,
                ease: 'power4.inOut',
              }
            )
              .to(
                [leftSpan, rightSpan],
                {
                  y: (index: number) =>
                    index === 0
                      ? containerHeight / 2.1 - leftSpanHeight
                      : containerHeight / 2.1 - rightSpanHeight,
                  duration: 2,
                  delay: 1.5,
                  ease: 'power4.inOut',
                }
              )
              .to(
                [leftSpan, rightSpan],
                {
                  x: (index: number) => (index === 0 ? 0 : 0),
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
    <div className="w-screen h-screen flex items-center justify-center z-10">
      <div ref={contentRef} className="text-center">
        <div className="w-screen h-screen flex items-center justify-center text-sm">
          <span ref={leftSpanRef} className="p-0.5">
            Just an ordinary DEVELOPER.
          </span>
          <span ref={rightSpanRef} className="p-0.5">
            From INDIA with pride
          </span>
        </div>
      </div>
    </div>
  );
};
