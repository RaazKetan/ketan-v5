import React from "react";
import { Link } from "react-router-dom";

export const ShimmerBtn: React.FC<{
  children: React.ReactNode;
  to?: string;
  href?: string;
  external?: boolean;
  className?: string;
}> = ({ children, to, href, external, className = "" }) => {
  const cls = `ds-btn-shimmer ${className}`.trim();
  const inner = <span>{children}</span>;
  if (to) {
    return (
      <Link to={to} className={cls} data-magnet="">
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        data-magnet=""
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} data-magnet="">
      {inner}
    </button>
  );
};
