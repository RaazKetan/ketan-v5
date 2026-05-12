import React from "react";

export const BeamFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`ds-beam-frame ${className}`.trim()}>{children}</div>;
