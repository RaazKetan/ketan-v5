import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TopBar } from "../../Navbar/TopBar";
import { MainNavbar } from "../../Navbar/MainNavbar";
import { NavbarIntersectionContrast } from "../../Navbar/behaviors/NavbarIntersectionContrast";
import { useIsMobile } from "../../../Hooks";
import { usePersonalData } from "../../../context/PersonalDataContext";
import { useNavigate } from "react-router-dom";
import { usePageTransition } from "../../../Hooks";
import { ProjectsGame } from "../../ProjectsGame";

gsap.registerPlugin(ScrollTrigger);

/* ─── Main Projects Component ─── */
export const Projects: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const collapsableDivRef = useRef<HTMLDivElement>(null);
  const backgroundDivRef = useRef<HTMLDivElement>(null);
  const mainNavbarRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const { MainNavbarData } = usePersonalData();
  const navigate = useNavigate();
  const { navigateWithCenterFill } = usePageTransition();

  /* ─── Entrance animations ─── */
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    tl.to(
      "#main-navbar",
      { height: "auto", opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.6"
    );

    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer"
    );
    tl.to(
      navItems,
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
      },
      "-=0.4"
    );
  }, []);

  /* ─── Navbar interactions ─── */
  useEffect(() => {
    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer, #navbar .raaz-brand"
    );

    navItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          let labelHTML = "";
          let numberHTML = "";

          if ((item as HTMLElement).classList.contains("raaz-brand")) {
            const dataText = (item as HTMLElement).dataset.text ?? "00 Home";
            const [number, label] = dataText.split(" ");
            numberHTML = `<span style="font-weight: 700; color: #fbbf24;">${number}</span><br/>`;
            labelHTML = `<span>${label}</span>`;
          } else {
            const itemIndex = parseInt(
              (item as HTMLElement).dataset.index || "0"
            );
            const data = MainNavbarData.navItems[itemIndex];

            numberHTML = data.number
              ? `<span style="font-weight: 700; color: #fbbf24;">${data.number}</span><br/>`
              : "";
            labelHTML = `<span>${data.label}</span>`;
          }

          backgroundDivRef.current.innerHTML = numberHTML + labelHTML;
          const targetHeight =
            typeof window !== "undefined" && window.innerWidth > 1440
              ? 200
              : 100;

          gsap.set(collapsableDivRef.current, {
            backgroundImage: "linear-gradient(#000, #000)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: `100% 0px`,
          });

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

          gsap.to(backgroundDivRef.current, {
            opacity: 0.34,
            duration: 1,
            ease: "power2.out",
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
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

      item.addEventListener("click", () => {
        const label = (
          item.querySelector("span:last-child")?.textContent || ""
        ).trim();
        const routeMap: Record<string, string> = {
          About: "/about",
          Projects: "/projects",
          Home: "/",
          "Agent Office": "/office",
        };

        if ((item as HTMLElement).classList.contains("raaz-brand")) {
          navigateWithCenterFill(navigate, "/");
          return;
        }

        const path = routeMap[label] || "/";
        navigateWithCenterFill(navigate, path);
      });
    });
  }, [MainNavbarData, navigate, navigateWithCenterFill]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden selection:bg-amber-100 selection:text-amber-900">
      <NavbarIntersectionContrast />

      {/* Top Bar */}
      <div ref={contentRef}>
        <TopBar />
      </div>

      {/* Main Navbar */}
      {!isMobile && (
        <MainNavbar
          collapsableDivRef={collapsableDivRef}
          backgroundDivRef={backgroundDivRef}
          mainNavbarRef={mainNavbarRef}
        />
      )}

      {/* Hero Section */}
      <section
        className="relative px-6 md:px-20 max-w-7xl mx-auto pt-32 pb-8"
        data-nav-contrast="dark"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 pixel-text"
            style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.5)" }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PROJECT OFFICE
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-400 mb-4"
          >
            Explore the office and meet my projects. Walk up to a character and
            press{" "}
            <kbd
              style={{
                background: "#374151",
                border: "1px solid #4b5563",
                borderRadius: "4px",
                padding: "1px 8px",
                fontFamily: "monospace",
                fontSize: "0.9em",
                color: "#fbbf24",
              }}
            >
              E
            </kbd>{" "}
            to open its details.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
          >
            <span>🎨 Left zone — Frontend</span>
            <span>⚙️ Centre zone — Backend</span>
            <span>🔬 Right zone — Experimental</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Game Section */}
      <section
        className="px-4 md:px-10 max-w-7xl mx-auto pb-20"
        data-nav-contrast="dark"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <ProjectsGame />
        </motion.div>
      </section>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  );
};
