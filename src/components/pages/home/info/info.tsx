import React from "react";
import type { FooterProps } from "../../../types/types";
import { useRef } from "react";
import gsap from "gsap";
import { useEffect } from "react";

export const Info: React.FC<FooterProps> = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const  nameRef = useRef<HTMLSpanElement>(null);
  const nameElement = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 2,
        ease: "expo.out",
      }
    );
  }, []);
  useEffect(() => {
    // Animation for the name ELement
    const nameEle = nameElement.current;
    if (nameEle) {
      gsap.fromTo(
        nameEle,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 2,
          ease: "expo.out",
        }
      );
    }

  }, []);
  useEffect(() => {
    // Animation for the name
    const name = nameRef.current;

    if (name) {
      const children = Array.from(name.children);
      const middleIndex = Math.floor(children.length / 2);

      gsap.fromTo(
        children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: {
            amount: 1.2, // Increase the total stagger duration for smoother animation
            from: middleIndex, // Start animation from the middle element
            each: 0.1, // Add slight delay between each letter
          },
        }
      );
    }
  }, []);
  return (

    <div className="flex flex-col items-center justify-center">
      {" "}
      <div  ref={contentRef} className="w-screen flex flex-row justify-between p-4" id="navbar"> 
        <span className="flex items-center justify-start relative w-1/3">
          <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 mr-2"
          >
        <path d="M12 2L2 7l10 5 10-5L12 2z" />
        <path d="M2 17l10 5 10-5V7L12 12 2 7v10z" />
          </svg>  
          Open for any <br /> collaboration 
          and offers
        </span>
        <span className="flex items-center justify-center relative w-1/3 text-center text-4xl font-bold">
          Raaz
        </span>
        <span className="flex justify-end relative w-1/3 text-center">
          Folio v.5
        </span>
      </div>
      <div className="flex pt-2 justify-center  w-screen h-screen">
            <span className="font-bold text-[20rem]" ref={nameRef}>
            {"Ketan Raj".split("").map((char, index) => (
              <span key={index} className="inline-block">
              {char}
              </span>
            ))}
            </span>
          <h2>(SDE)</h2>
          <h3>@Google</h3>
      </div>
    </div>
  );
};
