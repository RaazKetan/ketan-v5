import React from "react";

export const Chip: React.FC<{ children: React.ReactNode; led?: boolean; className?: string }> = ({
  children,
  led,
  className = "",
}) => (
  <span className={`chip ${className}`.trim()}>
    {led && <span className="led" />}
    {children}
  </span>
);
