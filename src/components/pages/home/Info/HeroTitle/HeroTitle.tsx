import React from "react";
import type { HeroTitleProps } from "./types";
import { useIsMobile } from "../../../../../Hooks";

export const HeroTitle: React.FC<HeroTitleProps> = ({ nameRef }) => {
  const isMobile = useIsMobile();
  return (
    <div className={`flex pt-2 ${isMobile ? "flex-col mt-10" : ""}  justify-center text-center mt-4 sm:mt-8`}>
      <span
        className="text-7xl md:text-8xl lg:text-[12rem] xl:text-[14rem] 2xl:text-[24rem] sm:font-bold"

        ref={nameRef}
      >
        {"Ketan Raj".split("").map((char, index) => (
          <span key={index} className="inline-block">
            {char}
          </span>
        ))}
      </span>
      <div className="flex flex-col">
        <span className={`${isMobile ? "font-bold mt-10" : ""}`}>(SDE)</span>
        <h3>@Google</h3>
        {isMobile && (
          <div className="flex flex-col  mt-10 items-center">
            <div className="text-sm uppercase mt-4 w-[70%] ">
            Ketan Raj (He/Him) AKA Raaz is a Software Engineer from Gaya, Bihar, India. 
            </div>
            <div className="text-sm uppercase mt-4 w-[60%]">
            passionate about building innovative solutions and solving complex problems.
              </div>
            </div>
        )}
      </div>
    </div>
  );
};
