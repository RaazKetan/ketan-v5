import React from "react";
import { useLocation } from "react-router-dom";
import { usePersonalData } from "@/context/PersonalDataContext";

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
}> = ({ status, copyright, index }) => {
  const { pathname } = useLocation();
  const { footerInfo } = usePersonalData();
  const idx = index ?? PAGE_INDEX[pathname] ?? footerInfo.craft;
  return (
    <footer className="ds-footer">
      <div className="left">
        <span className="led" />
        <span>{status ?? footerInfo.status}</span>
      </div>
      <div>{idx}</div>
      <div>{copyright ?? footerInfo.copyright}</div>
    </footer>
  );
};
