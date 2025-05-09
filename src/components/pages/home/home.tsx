import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Loader } from '../../loader/loader';

const Home: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSpanRef = useRef<HTMLSpanElement>(null);
  const rightSpanRef = useRef<HTMLSpanElement>(null);

  // Animate page content on page load
  useEffect(() => {
    const leftSpan = leftSpanRef.current;
    const rightSpan = rightSpanRef.current;
    const container = contentRef.current;

    if (container && leftSpan && rightSpan) {
      gsap.fromTo(
        container,
        { opacity: 0, y: 20},
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.5, 
          ease: 'power2.out', 
          // delay: 1.5,
          onComplete: () => {
        const tl = gsap.timeline();
        const leftSpanWidth = leftSpan.offsetWidth || 0;
        const rightSpanWidth = rightSpan.offsetWidth || 0;

        tl.to(
          [leftSpan, rightSpan],
          {
            x: (index) =>
          index === 0
            ? -(container.offsetWidth / 2.24 - leftSpanWidth / 2.5)
            : container.offsetWidth / 2.24 - rightSpanWidth / 2.5,
            duration: 1.5,
            delay: 1.5,
            ease: 'power4.out',
          },
          0 // Start both animations at the same time
        );
          }
        }
      );

      const tl = gsap.timeline();
      const leftSpanWidth = leftSpan.offsetWidth || 0;
      const rightSpanWidth = rightSpan.offsetWidth || 0;

      tl.to(
        [leftSpan, rightSpan],
        {
          x: (index) =>
            index === 0
              ? -(container.offsetWidth / 2.24 - leftSpanWidth / 2.5)
              : container.offsetWidth / 2.24 - rightSpanWidth / 2.5,
          duration: 1.5,
          // delay:1.5,
          ease: 'power4.out',
        },
        0 // Start both animations at the same time
      );
    }
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader/>
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

export default Home;