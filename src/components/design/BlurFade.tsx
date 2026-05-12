import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const BlurFade: React.FC<{
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
}> = ({ children, as = "div", className = "", delay = 0 }) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
    return () => ctx.revert();
  }, [delay]);

  return React.createElement(
    as,
    { ref, className: `blur-fade ${className}`.trim() },
    children
  );
};
