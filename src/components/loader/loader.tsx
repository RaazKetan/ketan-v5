import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const Loader: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  // Mouse-following animation
  useEffect(() => {
    const followCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Limit cursor within viewport bounds (optional padding of 20px)
      const boundedX = Math.min(window.innerWidth - 20, Math.max(20, clientX));
      const boundedY = Math.min(window.innerHeight - 20, Math.max(20, clientY));
      if(!isTracking) setIsTracking(true);

      gsap.to(textRef.current, {
        x: boundedX,
        y: boundedY,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', followCursor);

    // GSAP timeline animation
    const tl = gsap.timeline({
      onComplete: () => {
        window.removeEventListener('mousemove', followCursor);
        onFinish();
      },
    });

    tl.fromTo(
      textRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'power4.out' }
    ).to(loaderRef.current, {
      y: '-100%',
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: 1,
    });

    return () => {
      window.removeEventListener('mousemove', followCursor);
    };
  }, [onFinish]);

  // Count-up logic for loading percentage
  useEffect(() => {
    if (count < 100) {
      const intervalId = setInterval(() => {
        setCount((prevCount) => prevCount + 1);
      }, 30);
      return () => clearInterval(intervalId);
    }
  }, [count]);

  //cursor loading animation disable
  useEffect(() => {
    document.body.classList.add('loading');
    return () => {
      document.body.classList.remove('loading');
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed w-full h-full bg-black text-white z-50 cursor-none"
    >
      <div
        ref={textRef}
        className="pointer-events-none fixed text-2xl font-bold mix-blend-difference"
        style={{
           top: isTracking ? undefined : '50%',
    left: isTracking ? undefined : '50%',
    transform: isTracking ? undefined : 'translate(-50%, -50%)',
            position: 'fixed',
            pointerEvents: 'none',
          }}
      >
        Loading {count}%
      </div>
    </div>
  );
};
