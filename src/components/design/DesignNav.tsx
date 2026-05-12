import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS: Array<{ to: string; label: string }> = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const DesignNav: React.FC<{ mark?: string; available?: boolean }> = ({
  mark,
  available = true,
}) => {
  const { pathname } = useLocation();
  const [clock, setClock] = useState("— : —");

  const pageLabel =
    pathname === "/"
      ? "Portfolio"
      : (NAV_ITEMS.find((n) => pathname.startsWith(n.to))?.label ?? "Portfolio");
  const displayedMark =
    mark ?? `KR  /  ${pageLabel}  /  2026`;

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <nav className="ds-nav">
      <div className="mark">
        <span className="dot" />
        <span>{displayedMark}</span>
      </div>
      <div className="links">
        {NAV_ITEMS.map((n) => {
          const active =
            n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              data-magnet=""
              aria-current={active ? "page" : undefined}
            >
              {n.label}
            </Link>
          );
        })}
      </div>
      <div className="meta">
        <span className="time">{clock}</span>
        {available && (
          <span className="avail">
            <span className="led" /> Open to new work
          </span>
        )}
      </div>
    </nav>
  );
};
