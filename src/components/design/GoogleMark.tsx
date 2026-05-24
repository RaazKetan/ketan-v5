import React from "react";

/* The "Google" wordmark with the official per-letter brand colors.
   Drops out of any uppercase/mono parent (used in the eyebrow + hero strip).
   Sized in `em` so callers control the scale via the parent's font-size. */
export const GoogleMark: React.FC<{ scale?: number }> = ({ scale = 1.35 }) => (
  <span
    className="g-mark"
    aria-label="Google"
    style={{
      fontFamily: '"Product Sans", "Google Sans", var(--sans)',
      fontWeight: 500,
      fontSize: `${scale}em`,
      letterSpacing: "-0.01em",
      textTransform: "none",
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "baseline",
    }}
  >
    <span style={{ color: "#4285F4" }}>G</span>
    <span style={{ color: "#EA4335" }}>o</span>
    <span style={{ color: "#FBBC04" }}>o</span>
    <span style={{ color: "#4285F4" }}>g</span>
    <span style={{ color: "#34A853" }}>l</span>
    <span style={{ color: "#EA4335" }}>e</span>
  </span>
);
