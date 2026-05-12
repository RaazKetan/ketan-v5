import React from "react";
import { Link } from "react-router-dom";

type Common = {
  children: React.ReactNode;
  primary?: boolean;
  magnet?: boolean;
  className?: string;
};

type AnchorProps = Common & {
  to?: string;
  href?: string;
  external?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export const Btn: React.FC<AnchorProps> = ({
  children,
  primary,
  magnet = true,
  className = "",
  to,
  href,
  external,
  onClick,
}) => {
  const cls = `ds-btn${primary ? " primary" : ""} ${className}`.trim();
  const dataMag = magnet ? { "data-magnet": "" } : {};
  const content = (
    <>
      <span className="fill" />
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...dataMag} onClick={onClick}>
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
        onClick={onClick}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...dataMag} onClick={onClick}>
      {content}
    </button>
  );
};
