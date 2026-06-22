import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type Props = {
  value: number;
  /* How long the count-up takes when it first enters the viewport. */
  durationMs?: number;
  /* Number formatter (defaults to comma-separated integer). */
  format?: (n: number) => string;
  className?: string;
};

/* Magic UI flavor: smoothly counts from 0 to `value` when the element
   first enters the viewport. Uses requestAnimationFrame + an ease-out
   curve so the last digits aren't a blur. */
export const NumberTicker: React.FC<Props> = ({
  value,
  durationMs = 1200,
  format,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); /* easeOutCubic */
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / durationMs);
      setDisplay(Math.round(ease(t) * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs]);

  const out = format ? format(display) : display.toLocaleString();
  return (
    <motion.span ref={ref} className={className}>
      {out}
    </motion.span>
  );
};

export default NumberTicker;
