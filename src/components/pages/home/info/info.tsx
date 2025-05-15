import React, { useRef, useEffect } from "react";
import type { FooterProps } from "../../../types/types";
import gsap from "gsap";

export const Info: React.FC<FooterProps> = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const collapsableDivRef = useRef<HTMLDivElement>(null);
  const backgroundDivRef = useRef<HTMLDivElement>(null);
  const mainNavbarRef = useRef<HTMLDivElement>(null);

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
    if (nameRef.current) {
      const children = Array.from(nameRef.current.children);
      gsap.fromTo(
        children,
        { y: 250 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "expoScale",
          stagger: {
            amount: 0.3,
            from: "center",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer"
    );
    console.log(
      "Window width:",
      typeof window !== "undefined" ? window.innerWidth : "N/A"
    ),

    navItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
            gsap.to(collapsableDivRef.current, {
            height: typeof window !== "undefined" && window.innerWidth > 1440 ? 200 : 100, // 200 for xl and 2xl 
            // screens, 100 for others
            backgroundColor: "black",
            duration: 0.3,
            ease: "power2.out",
            transformOrigin: "-50% -50%",
            onStart: () => {
              (item as HTMLElement).style.color = "white"; // Change the hovered item's text color to white
            },
            });
          backgroundDivRef.current.textContent = item.textContent;
          gsap.to(backgroundDivRef.current, {
            opacity: 0.2,
            scale: 5,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          gsap.to(collapsableDivRef.current, {
            height: 0, // Animate back to height 0
            backgroundColor: "transparent",
            duration: 0.3,
            ease: "power2.in",
            transformOrigin: "-50% -50%", // Maintain transform origin
            onComplete: () => {
              if (collapsableDivRef.current) {
                collapsableDivRef.current.style.height = "auto"; // Reset height to auto after animation
                (item as HTMLElement).style.color = ""; // Revert the hovered item's text color to its default
              }
            },
          });
          gsap.to(backgroundDivRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              if (backgroundDivRef.current) {
                backgroundDivRef.current.textContent = "";
              }
            },
          });
        }
      });
    });

    return () => {
      navItems.forEach((item) => {
        item.removeEventListener("mouseenter", () => {});
        item.removeEventListener("mouseleave", () => {});
      });
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {/* Header Navbar */}
        <div
          ref={contentRef}
          className="w-screen flex flex-row justify-between p-4"
          id="navbar"
        >
          <span className="flex items-center justify-start relative w-1/3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 mr-2"
            >
              <path d="M12 2L2 7l10 5 10-5L12 2z" />
              <path d="M2 17l10 5 10-5V7L12 12 2 7v10z" />
            </svg>
            Open for any <br /> collaboration and offers
          </span>
          <span className="flex items-center justify-center relative w-1/3 text-center sm:text-xl md:text-2xl lg:text-4xl font-bold">
            Raaz &copy;
          </span>
          <span className="flex justify-end relative w-1/3 text-center text-sm">
            Folio v.5
          </span>
        </div>
        {/* Main content */}
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
        {/* Main Navbar */}
        <div
          ref={mainNavbarRef}
          id="main-navbar"
          className="mt-8 hidden sm:block md:block" // Added flex items-center
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
            >
              {/* Hovered text will be placed here */}
            </div>
            <div
              id="main-component-of-navbar"
              className="flex flex-row justify-between p-4 relative h-[5vw] items-center"
            >
              <span className="cursor-pointer">
                01 <br /> About
              </span>
              <span className="cursor-pointer">
                02 <br /> Experience
              </span>
              <span className="cursor-pointer">
                03 <br /> Playground
              </span>
              <span className="cursor-pointer">
                04 <br /> Contact
              </span>
              <span className="cursor-pointer"> &copy; 2025</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};