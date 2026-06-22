import React, { useEffect, useRef, useState } from "react";

type Point = { date?: string; count: number };

type Props = {
  data: Point[];
  /* Optional accent color (defaults to var(--accent)). */
  color?: string;
  /* Pixel height of the chart. */
  height?: number;
  className?: string;
};

/* Lightweight inline-SVG sparkline. Magic UI flavor: animated path
   draw-in via stroke-dasharray, hover dot reveals value tooltip.
   Zero deps beyond React. */
export const Sparkline: React.FC<Props> = ({
  data,
  color,
  height = 56,
  className = "",
}) => {
  const ref = useRef<SVGPathElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(220);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e?.contentRect.width;
      if (w && Math.abs(w - width) > 1) setWidth(Math.floor(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  useEffect(() => {
    /* Replay the draw-in animation when data changes. */
    const path = ref.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.transition = "none";
    path.style.strokeDasharray = `${len} ${len}`;
    path.style.strokeDashoffset = String(len);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    path.getBoundingClientRect(); /* force reflow */
    path.style.transition = "stroke-dashoffset 1.2s ease-out";
    path.style.strokeDashoffset = "0";
  }, [data, width]);

  if (!data.length) {
    return (
      <div ref={wrapRef} className={className} style={{ height }}>
        <div className="sp-empty">No data yet</div>
        <style>{`.sp-empty { font-family: var(--mono); font-size: 10px; color: var(--muted); padding-top: 18px; }`}</style>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = width / Math.max(1, data.length - 1);
  const padTop = 6;
  const padBot = 6;
  const innerH = height - padTop - padBot;
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = padTop + (1 - d.count / max) * innerH;
    return { x, y, count: d.count, date: d.date };
  });
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    `${path} L ${pts[pts.length - 1]!.x.toFixed(1)} ${height - padBot}` +
    ` L 0 ${height - padBot} Z`;

  const c = color || "var(--accent)";

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative" }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        <defs>
          <linearGradient id="sp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sp-fill)" stroke="none" />
        <path
          ref={ref}
          d={path}
          fill="none"
          stroke={c}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 3.5 : 0}
            fill={c}
            style={{ transition: "r .15s" }}
          />
        ))}
        {pts.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={i === 0 ? 0 : p.x - stepX / 2}
            y={0}
            width={stepX}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && pts[hover] && (
        <div
          className="sp-tip"
          style={{
            left: Math.min(width - 100, Math.max(0, pts[hover]!.x - 40)),
            top: Math.max(0, pts[hover]!.y - 28),
          }}
        >
          <strong>{pts[hover]!.count}</strong>
          {pts[hover]!.date && (
            <span className="sp-tip-d"> {pts[hover]!.date}</span>
          )}
        </div>
      )}
      <style>{`
        .sp-tip {
          position: absolute;
          background: var(--ink); color: var(--bg);
          font-family: var(--mono); font-size: 10px;
          padding: 4px 7px; border-radius: 4px;
          pointer-events: none; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,.18);
        }
        .sp-tip-d { color: color-mix(in oklab, var(--bg) 70%, transparent); margin-left: 6px; }
      `}</style>
    </div>
  );
};

export default Sparkline;
