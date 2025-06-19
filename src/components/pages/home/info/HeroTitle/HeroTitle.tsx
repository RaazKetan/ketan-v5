import React from "react";
import type { HeroTitleProps } from "./types";
import { useIsMobile } from "../../../../../Hooks";
import { usePersonalData } from "../../../../../context/PersonalDataContext";

export const HeroTitle: React.FC<HeroTitleProps> = ({ nameRef }) => {
  const isMobile = useIsMobile();
  const { heroTitle } = usePersonalData();
  return (
    <div className={`flex pt-2 ${isMobile ? "flex-col mt-10" : ""}  justify-center text-center mt-4 sm:mt-8`}>
      <span
        className="text-7xl md:text-8xl lg:text-[12rem] xl:text-[14rem] 2xl:text-[24rem] sm:font-bold"

        ref={nameRef}
      >
        {heroTitle.name.split("").map((char, index) => (
          <span key={index} className="inline-block">
            {char}
          </span>
        ))}
      </span>
      <div className="flex flex-col">
        <span className={`${isMobile ? "font-bold mt-10" : ""}`}>({heroTitle.title})</span>
        <h3>@{heroTitle.company}</h3>
        {isMobile && (
          <div className="flex flex-col  mt-10 items-center">
            <div className="text-sm uppercase mt-4 w-[70%] ">
           {heroTitle.aboutP1}
            </div>
            <div className="text-sm uppercase mt-4 w-[60%]">
          {heroTitle.aboutP2}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};
