import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/* Magic UI flavor: shifting linear-gradient inside a serif label. Pure
   CSS — no JS animation needed. */
export const AnimatedGradientText: React.FC<Props> = ({
  children,
  className = "",
}) => {
  return (
    <span className={`agt ${className}`.trim()}>
      {children}
      <style>{`
        .agt {
          background-image: linear-gradient(
            90deg,
            var(--ink) 0%,
            var(--accent) 40%,
            var(--ink) 80%
          );
          background-size: 250% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: agt-shift 6s ease-in-out infinite;
        }
        @keyframes agt-shift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>
    </span>
  );
};

export default AnimatedGradientText;
