import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const Loader: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);  

  useEffect(()=>{
    const followCursor = (e:MouseEvent)=>{
        gsap.to(textRef.current, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.5,
            ease: 'power2.out',
        });
    };
    window.addEventListener('mousemove', followCursor);
    const tl = gsap.timeline({ onComplete: ()=>{
        window.removeEventListener('mousemove', followCursor);
        onFinish();
    } });
    tl.fromTo(
      textRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: 'power4.out' }
    ).to(loaderRef.current, {
      y: '-100%',
      duration: 1.5,
      ease: 'power2.inOut',
      delay: 1,
      opacity: 0,

    });
  }, [onFinish]);


  useEffect(()=>{
    if (count < 100) {
        const intervalId = setInterval(()=>{
            setCount((prevCount) => prevCount + 1);

        }, 30);
        return () => clearInterval(intervalId);
    }
  },[count]);

  return (
    <div
      ref={loaderRef}
      className="fixed top-0 left-0 w-full h-full bg-black text-white z-50"
    >
      <div
        ref={textRef}
        className="pointer-events-none fixed text-2xl font-bold mix-blend-difference"
        style={{transform: 'translate(-50%, -50%)'}}
      >
        Loading {count}%
      </div>
    </div>
  );
};
