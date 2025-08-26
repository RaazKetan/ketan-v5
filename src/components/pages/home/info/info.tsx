import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { TopBar } from "../../../Navbar/TopBar";
import { MainNavbar } from "../../../Navbar/MainNavbar";
import { useIsMobile } from "../../../../Hooks";
import { HeroTitle } from "./HeroTitle";
import { usePersonalData } from "../../../../context/PersonalDataContext";
import { useNavigate } from "react-router-dom";
import { usePageTransition } from "../../../../Hooks";

export const Info: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const collapsableDivRef = useRef<HTMLDivElement>(null);
  const backgroundDivRef = useRef<HTMLDivElement>(null);
  const mainNavbarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { MainNavbarData, heroTitle } = usePersonalData();
  const navigate = useNavigate();
  const { navigateWithCenterFill } = usePageTransition();

  // Fade in the top bar on initial load
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

  // Stagger in hero letters and then reveal the main navbar
  useEffect(() => {
    if (nameRef.current) {
      const children = Array.from(nameRef.current.children);
      const navItems = document.querySelectorAll(
        "#main-navbar span.cursor-pointer"
      );

      const tl = gsap.timeline();

      // Bring each hero letter from below with a center-origin stagger
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

      // Expand and show the main navbar container
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

      // Then bring in the navbar items
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

  // Hover interactions: grow a black band from center and show contextual text
  useEffect(() => {
    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer, #navbar .raaz-brand"
    );

    navItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          // Build overlay text (number + label) based on hovered item
          let labelHTML = "";
          let numberHTML = "";

          if ((item as HTMLElement).classList.contains("raaz-brand")) {
            const dataText = (item as HTMLElement).dataset.text ?? "00 Home";
            const [number, label] = dataText.split(" ");
            numberHTML = `<span style="font-weight: 700; color: #fbbf24;">${number}</span><br/>`;
            labelHTML = `<span>${label}</span>`;
          } else {
            // Get the data-index from the hovered item
            const itemIndex = parseInt((item as HTMLElement).dataset.index || "0");
            const data = MainNavbarData.navItems[itemIndex];
            
            numberHTML = data.number
              ? `<span style="font-weight: 700; color: #fbbf24;">${data.number}</span><br/>`
              : "";
            labelHTML = `<span>${data.label}</span>`;
          }

          backgroundDivRef.current.innerHTML = numberHTML + labelHTML;
          const targetHeight =
            typeof window !== "undefined" && window.innerWidth > 1440 ? 200 : 100;

          // Paint a background-only band that grows from the center
          // (uses CSS background-size so children remain fully visible)
          gsap.set(collapsableDivRef.current, {
            backgroundImage: "linear-gradient(#000, #000)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: `100% 0px`,
          });

          // Expand the band to the target height and tint hovered item text
          gsap.to(collapsableDivRef.current, {
            backgroundSize: `100% ${targetHeight}px`,
            duration: 1,
            ease: "power3.out",
            onStart: () => {
              if (!(item as HTMLElement).classList.contains("raaz-brand")) {
                (item as HTMLElement).style.color = "white";
              }
            },
          });

          // Center the overlay text within the expanding band (non-interactive)
          gsap.set(backgroundDivRef.current, {
            position: "absolute",
            left: 0,
            top: "50%",
            yPercent: -50,
            width: "100%",
            height: targetHeight,
            zIndex: 1,
            opacity: 0,
            scale: 2,
            pointerEvents: "none",
          });

          // Fade in overlay text slightly
          gsap.to(backgroundDivRef.current, {
            opacity: 0.34,
            duration: 1,
            ease: "power2.out",
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          // Collapse the band back to zero height and reset temporary styles
          gsap.to(collapsableDivRef.current, {
            backgroundSize: "100% 0px",
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              if (collapsableDivRef.current) {
                collapsableDivRef.current.style.backgroundImage = "";
                collapsableDivRef.current.style.backgroundRepeat = "";
                collapsableDivRef.current.style.backgroundPosition = "";
                collapsableDivRef.current.style.backgroundSize = "";
              }
              if (!(item as HTMLElement).classList.contains("raaz-brand")) {
                (item as HTMLElement).style.color = "";
              }
            },
          });

          // Hide and clean up overlay text styles
          gsap.to(backgroundDivRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              if (backgroundDivRef.current) {
                backgroundDivRef.current.textContent = "";
                backgroundDivRef.current.style.position = "";
                backgroundDivRef.current.style.top = "";
                backgroundDivRef.current.style.left = "";
                backgroundDivRef.current.style.width = "";
                backgroundDivRef.current.style.height = "";
                backgroundDivRef.current.style.transform = "";
                backgroundDivRef.current.style.zIndex = "";
              }
            },
          });
        }
      });

      // Click: center-fill overlay, then navigate
      item.addEventListener("click", () => {
        const label = (item.querySelector("span:last-child")?.textContent || "").trim();
        const routeMap: Record<string, string> = {
          About: "/about",
        };
        const path = routeMap[label] || "/";
        navigateWithCenterFill(navigate, path);
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
      {!isMobile && (
         <div className="flex flex-row mt-30 items-center justify-between">
            <div className="text-xs uppercase mt-4 w-[30%] text-center ">
           {heroTitle.aboutP1}
            </div>
            <div className="text-xs uppercase mt-4 w-[30%] text-center">
          {heroTitle.aboutP2}
              </div>
            </div>

      )}
    </div>
  );
};