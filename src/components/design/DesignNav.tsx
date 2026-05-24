import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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
  const [clock, setClock] = useState("- : -");
  const navRef = useRef<HTMLElement>(null);

  /* Nav owns its own entrance - pages no longer try to animate .ds-nav,
     which removes the "GSAP target .ds-nav not found" warning and the
     race where the new page's timeline hides nav before its tween plays. */
  useGSAP(
    () => {
      gsap.from(navRef.current, {
        autoAlpha: 0,
        y: -16,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.05,
      });
    },
    { scope: navRef }
  );

  const pageLabel =
    pathname === "/"
      ? "Portfolio"
      : (NAV_ITEMS.find((n) => pathname.startsWith(n.to))?.label ?? "Portfolio");
  const displayedMark =
    mark ?? `KR  /  ${pageLabel}  /  2026`;

  useEffect(() => {
    /* Format Asia/Kolkata time (IST = UTC+5:30). Intl handles DST + locale
       quirks correctly without needing a date library. */
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setClock(`${fmt.format(new Date())} IST`);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <nav className="ds-nav" ref={navRef}>
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
            <span className="led led-current" /> SWE Emergent (YC24)
          </span>
        )}
      </div>
    </nav>
  );
};
