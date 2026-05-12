import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Marquee: React.FC<{ items: string[]; duration?: number }> = ({
  items,
  duration = 28,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const anim = gsap.to(track, {
      xPercent: -33.333,
      ease: "none",
      duration,
      repeat: -1,
    });
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const v = 1 + self.getVelocity() / 4000;
        gsap.to(anim, {
          timeScale: Math.max(0.4, Math.min(4, Math.abs(v))),
          duration: 0.3,
          overwrite: true,
        });
      },
    });

    return () => {
      anim.kill();
      st.kill();
    };
  }, [items, duration]);

  const tripled = [0, 1, 2].flatMap((c) =>
    items.map((t, i) => (
      <span className="item" key={`${c}-${i}`}>
        {t} <span className="dot" />
      </span>
    ))
  );

  return (
    <div className="ds-marquee" ref={wrapRef}>
      <div className="ds-marquee-track" ref={trackRef}>
        {tripled}
      </div>
    </div>
  );
};
