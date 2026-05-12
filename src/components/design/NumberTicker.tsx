import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const NumberTicker: React.FC<{ value: number; className?: string }> = ({
  value,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    el.textContent = "0";
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: value,
          duration: 2.4,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      },
    });
    return () => st.kill();
  }, [value]);

  return <span ref={ref} className={className}>0</span>;
};
