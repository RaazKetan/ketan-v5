import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  /** Disable on this element if parent timeline is going to drive it (e.g. hero entrance). */
  passive?: boolean;
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  as = "div",
  className = "",
  delay = 0,
  passive,
}) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (passive) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 24,
        duration: 1,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
    return () => ctx.revert();
  }, [delay, passive]);

  return React.createElement(
    as,
    { ref, className, "data-reveal": "" },
    children
  );
};
