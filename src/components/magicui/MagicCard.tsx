import React, { useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /* Strength of the spotlight (0..1). */
  intensity?: number;
};

/* Magic UI flavor: cursor-tracking spotlight that highlights the card
   wherever the mouse is. Pure CSS variables — no framer-motion overhead. */
export const MagicCard: React.FC<Props> = ({
  children,
  className = "",
  intensity = 0.12,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", `-200px`);
    el.style.setProperty("--my", `-200px`);
  };

  return (
    <div
      ref={ref}
      className={`mui-card ${className}`.trim()}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        {
          "--mx": "-200px",
          "--my": "-200px",
          "--intensity": String(intensity),
        } as React.CSSProperties
      }
    >
      <div className="mui-card-spotlight" aria-hidden />
      <div className="mui-card-body">{children}</div>
      <style>{`
        .mui-card {
          position: relative;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--bg);
          overflow: hidden;
          transition: border-color .3s ease;
        }
        .mui-card:hover { border-color: color-mix(in oklab, var(--accent) 30%, var(--line)); }
        .mui-card-spotlight {
          pointer-events: none;
          position: absolute; inset: 0;
          background: radial-gradient(
            240px circle at var(--mx) var(--my),
            color-mix(in oklab, var(--accent) calc(var(--intensity) * 100%), transparent) 0%,
            transparent 60%
          );
          transition: opacity .25s;
        }
        .mui-card-body { position: relative; padding: 18px 20px; }
      `}</style>
    </div>
  );
};

export default MagicCard;
