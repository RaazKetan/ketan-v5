import React from "react";
import type { HeroTitleProps } from "./types";
import { useIsMobile } from "../../../../../Hooks";
import { usePersonalData } from "../../../../../context/PersonalDataContext";

export const HeroTitle: React.FC<HeroTitleProps> = ({ nameRef }) => {
  const isMobile = useIsMobile();
  const { name, title, company, aboutP1, aboutP2 } = usePersonalData();
  return (
    <div className={`flex pt-2 ${isMobile ? "flex-col mt-10" : ""}  justify-center text-center mt-4 sm:mt-8`}>
      <span
        className="text-7xl md:text-8xl lg:text-[12rem] xl:text-[14rem] 2xl:text-[24rem] sm:font-bold"

        ref={nameRef}
      >
        {name.split("").map((char, index) => (
          <span key={index} className="inline-block">
            {char}
          </span>
        ))}
      </span>
      <div className="flex flex-col">
        <span className={`${isMobile ? "font-bold mt-10" : ""}`}>({title})</span>
        <h3>@{company}</h3>
        {isMobile && (
          <div className="flex flex-col  mt-10 items-center">
            <div className="text-sm uppercase mt-4 w-[70%] ">
           {aboutP1}
            </div>
            <div className="text-sm uppercase mt-4 w-[60%]">
          {aboutP2}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};
