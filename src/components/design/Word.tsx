import React from "react";

/* Word-mask helper for GSAP text reveal. Wraps the inner text in .word > span
   so it can be animated yPercent 110 -> 0 with overflow hidden. */
export const Word: React.FC<{ children: React.ReactNode; em?: boolean; className?: string }> = ({
  children,
  em,
  className = "",
}) => (
  <span className={`word ${className}`.trim()}>
    <span>{em ? <em>{children}</em> : children}</span>
  </span>
);
