import React from "react";
import { useLocation } from "react-router-dom";

const PAGE_INDEX: Record<string, string> = {
  "/": "01 / 05 · Home",
  "/projects": "02 / 05 · Projects",
  "/work": "03 / 05 · Work",
  "/about": "04 / 05 · About",
  "/contact": "05 / 05 · Contact",
};

export const DesignFooter: React.FC<{
  status?: string;
  copyright?: string;
  index?: string;
}> = ({
  status = "Available · Q2 2026",
  copyright = "© 2026 Ketan Raj",
  index,
}) => {
  const { pathname } = useLocation();
  const idx = index ?? PAGE_INDEX[pathname] ?? "Portfolio · v5";
  return (
    <footer className="ds-footer">
      <div className="left">
        <span className="led" />
        <span>{status}</span>
      </div>
      <div>{idx}</div>
      <div>{copyright}</div>
    </footer>
  );
};
