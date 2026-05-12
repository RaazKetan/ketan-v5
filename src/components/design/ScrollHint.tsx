import React from "react";

export const ScrollHint: React.FC<{ label?: string }> = ({ label = "Scroll" }) => (
  <div className="scroll-hint">
    <span className="bar" />
    <span>{label}</span>
  </div>
);
