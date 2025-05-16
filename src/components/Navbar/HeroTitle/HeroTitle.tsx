import React from "react";
import type { HeroTitleProps } from "./types";

export const HeroTitle: React.FC<HeroTitleProps> = ({ nameRef }) => {
  return (
    <div className="flex pt-2 justify-center text-center mt-4">
      <span
        className="md:text-5xl sm:text-3xl sm:text-[4rem] md:text-[8rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[24rem] p-4 text-space"
        ref={nameRef}
      >
        {"Ketan Raj".split("").map((char, index) => (
          <span key={index} className="inline-block">
            {char}
          </span>
        ))}
      </span>
      <div className="flex flex-col">
        <h2>(SDE)</h2>
        <h3>@Google</h3>
      </div>
    </div>
  );
};
