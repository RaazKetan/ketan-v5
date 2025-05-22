import React, { useRef } from "react";
import type { FooterProps } from "../types/types";
import { useFooterAnimation } from "../../Hooks";

export const Footer: React.FC<FooterProps> = ({ onAnimationComplete }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSpanRef = useRef<HTMLSpanElement>(null);
  const rightSpanRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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
        <div className="flex items-center justify-center text-sm relative">
          <span ref={leftSpanRef} className="p-0.5 whitespace-nowrap sm:text-sm">
            Just an ordinary DEVELOPER.
          </span>
          <span ref={rightSpanRef} className="p-0.5 whitespace-nowrap sm:text-sm">
            From INDIA with pride
          </span>
        </div>
        
        {/* Image container that appears in the middle */}
        <div 
          ref={imageRef} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 sm:w-80 sm:h-40"
        >
          {/* SVG Illustration similar to your design */}
          <svg 
            viewBox="0 0 400 200" 
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background elements */}
            <circle cx="320" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M315 35 L325 35 M320 30 L320 40 M325 45 L315 45" fill="none" stroke="currentColor" strokeWidth="1"/>
            
            <circle cx="350" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="350" cy="60" r="2" fill="currentColor"/>
            
            {/* Main character */}
            <g transform="translate(150, 80)">
              {/* Chair */}
              <rect x="20" y="60" width="80" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="20" y1="100" x2="10" y2="120" stroke="currentColor" strokeWidth="2"/>
              <line x1="100" y1="100" x2="110" y2="120" stroke="currentColor" strokeWidth="2"/>
              
              {/* Person */}
              <circle cx="60" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
              <rect x="2" y="30" width="6" height="15" rx="3" fill="currentColor"/> {/* Glasses */}
              <rect x="10" y="30" width="6" height="15" rx="3" fill="currentColor"/>
              <line x1="8" y1="37" x2="10" y2="37" stroke="currentColor" strokeWidth="1"/>
              
              {/* Body */}
              <rect x="40" y="42" width="40" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/>
              
              {/* Laptop */}
              <rect x="30" y="50" width="60" height="35" rx="3" fill="currentColor"/>
              <rect x="32" y="52" width="56" height="20" rx="2" fill="white"/>
              <circle cx="60" cy="78" r="2" fill="white"/>
              
              {/* Arms */}
              <line x1="40" y1="50" x2="25" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <line x1="80" y1="50" x2="95" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Legs */}
              <line x1="50" y1="72" x2="50" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <line x1="70" y1="72" x2="70" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Feet */}
              <ellipse cx="45" cy="95" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="75" cy="95" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2"/>
            </g>
            
            {/* Cat */}
            <g transform="translate(80, 140)">
              <ellipse cx="15" cy="15" rx="12" ry="8" fill="currentColor"/>
              <polygon points="8,8 12,2 16,8" fill="currentColor"/>
              <polygon points="14,8 18,2 22,8" fill="currentColor"/>
              <circle cx="12" cy="12" r="1" fill="white"/>
              <circle cx="18" cy="12" r="1" fill="white"/>
              <path d="M15 14 Q15 16 13 16 Q15 16 17 16 Q15 16 15 14" fill="none" stroke="white" strokeWidth="0.5"/>
              <path d="M25 20 Q35 18 40 25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </g>
            
            {/* Floating elements */}
            <circle cx="80" cy="50" r="2" fill="currentColor" opacity="0.6"/>
            <circle cx="320" cy="120" r="1.5" fill="currentColor" opacity="0.4"/>
            <circle cx="100" cy="30" r="1" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
};