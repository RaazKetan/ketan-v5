import React from "react";
import { Link } from "react-router-dom";
import { trackClick } from "../../lib/analytics";

type Common = {
  children: React.ReactNode;
  primary?: boolean;
  magnet?: boolean;
  className?: string;
  /* Override the analytics label. Defaults to the child text content. */
  track?: string;
};

type AnchorProps = Common & {
  to?: string;
  href?: string;
  external?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

/* Best-effort label fallback: try the children string, else "button". */
function readChildLabel(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    const first = children.find((c) => typeof c === "string");
    if (typeof first === "string") return first;
  }
  return "button";
}

export const Btn: React.FC<AnchorProps> = ({
  children,
  primary,
  magnet = true,
  className = "",
  to,
  href,
  external,
  onClick,
  track,
}) => {
  const cls = `ds-btn${primary ? " primary" : ""} ${className}`.trim();
  const dataMag = magnet ? { "data-magnet": "" } : {};
  const content = (
    <>
      <span className="fill" />
      {children}
    </>
  );

  const handleClick = (e: React.MouseEvent) => {
    trackClick(track ?? readChildLabel(children), {
      to: to ?? "",
      href: href ?? "",
      primary: !!primary,
    });
    onClick?.(e);
  };

  if (to) {
    return (
      <Link to={to} className={cls} {...dataMag} onClick={handleClick}>
        {content}
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
        {...dataMag}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...dataMag} onClick={handleClick}>
      {content}
    </button>
  );
};
