import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { TopBar } from "../../../Navbar/TopBar";
import { MainNavbar } from "../../../Navbar/MainNavbar";
import { useIsMobile } from "../../../../Hooks";
import { HeroTitle } from "./HeroTitle";
import { usePersonalData } from "../../../../context/PersonalDataContext";

export const Info: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const collapsableDivRef = useRef<HTMLDivElement>(null);
  const backgroundDivRef = useRef<HTMLDivElement>(null);
  const mainNavbarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { MainNavbarData } = usePersonalData();
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
      const navItems = document.querySelectorAll(
        "#main-navbar span.cursor-pointer"
      );

      const tl = gsap.timeline();

      tl.fromTo(
        children,
        { y: 250, opacity: 0 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: {
            amount: 0.18,
            from: "center",
          },
        }
      );

      tl.fromTo(
        "#main-navbar",
        {
          height: 0,
          opacity: 0,
        },
        {
          height: "auto",
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=1"
      );

      tl.fromTo(
        navItems,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        },
        "-=0.4"
      );
    }
  }, []);

  useEffect(() => {
    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer, #navbar span.cursor-pointer"
    );
    navItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          const data = MainNavbarData.navItems[index];
          const numberHTML = data.number
            ? `<span style="font-weight: 700; color: #fbbf24;">${data.number}</span><br/>`
            : "";
          const labelHTML = `<span>${data.label}</span>`;

          backgroundDivRef.current.innerHTML = numberHTML + labelHTML;

          gsap.to(collapsableDivRef.current, {
            height:
              typeof window !== "undefined" && window.innerWidth > 1440
                ? 200
                : 100,
            backgroundColor: "black",
            duration: 0.3,
            ease: "power2.out",
            transformOrigin: "-50% -50%",
            onStart: () => {
              if (!(item as HTMLElement).classList.contains("raaz-brand")) {
                (item as HTMLElement).style.color = "white";
              }
            },
          });
          gsap.to(backgroundDivRef.current, {
            opacity: 0.2,
            scale: 4,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      });
      item.addEventListener("mouseleave", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          gsap.to(collapsableDivRef.current, {
            height: 0,
            backgroundColor: "transparent",
            duration: 0.3,
            ease: "power2.in",
            transformOrigin: "-50% -50%",
            onComplete: () => {
              if (collapsableDivRef.current) {
                collapsableDivRef.current.style.height = "auto";
                if (!(item as HTMLElement).classList.contains("raaz-brand")) {
                  (item as HTMLElement).style.color = "";
                }
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
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div ref={contentRef}>
        <TopBar />
      </div>
      <HeroTitle nameRef={nameRef} />
      {!isMobile && (
        <MainNavbar
          collapsableDivRef={collapsableDivRef}
          backgroundDivRef={backgroundDivRef}
          mainNavbarRef={mainNavbarRef}
        />
      )}
    </div>
  );
};
