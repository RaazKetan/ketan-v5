import React from "react";
import type { MainNavbarProps } from "./types";
import { usePersonalData } from "../../../context/PersonalDataContext";

export const MainNavbar: React.FC<MainNavbarProps> = ({
  collapsableDivRef,
  backgroundDivRef,
  mainNavbarRef,
}) => {
  const {MainNavbarData} = usePersonalData();
  return (
    <div
      ref={mainNavbarRef}
      id="main-navbar"
      className="mt-8 opacity-0 h-0 overflow-hidden"
    >
      <div
        ref={collapsableDivRef}
        id="collapsable div"
        className="w-screen text-[11px] overflow-hidden relative"
      >
        <div
          ref={backgroundDivRef}
          id="background of collapsable div"
          className="fixed w-full h-full flex items-center justify-center text-[2vw] font-bold text-amber-50 opacity-0 pointer-events-none"
        ></div>
        <div
          id="main-component-of-navbar"
          className="flex flex-row justify-between p-4 relative h-[5vw] items-center"
        >
          {MainNavbarData.navItems.map((item, i) => (
            <span key={i} className="cursor-pointer nav-item">
              {item.number && (
                <span className="font-bold text-[0.75rem] text-amber-400">{item.number}</span>
              )}
              <br />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
