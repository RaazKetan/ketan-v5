import React, { useRef } from "react";
import type { FooterProps } from "../types/types";
import { useFooterAnimation } from "../../Hooks";
import { usePersonalData } from "../../context/PersonalDataContext";
import bgVideo from "../../assets/me.mp4";

export const Footer: React.FC<FooterProps> = ({ onAnimationComplete }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSpanRef = useRef<HTMLSpanElement>(null);
  const rightSpanRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { footerData } = usePersonalData();

  useFooterAnimation({
    contentRef,
    leftSpanRef,
    rightSpanRef,
    imageRef,
    onAnimationComplete,
  });

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
      <div ref={contentRef} className="text-center relative">
        <div className={`flex items-center justify-center`}>
          <span ref={leftSpanRef} className="p-0.5 whitespace-nowrap text-[10px]">
           {footerData.tagline}
          </span>
          <span ref={rightSpanRef} className="p-0.5 whitespace-nowrap text-[10px]">
            {footerData.footerNote}
          </span>
        </div>
        
        {/* Image container that appears in the middle */}
        <div 
          ref={imageRef} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-80 sm:h-40"
        >
         <video autoPlay loop muted
          className="w-full h-full object-cover"
         >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
        </div>
      </div>
    </div>
  );
};