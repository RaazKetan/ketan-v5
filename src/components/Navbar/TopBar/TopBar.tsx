import React, { useState, useRef, useEffect } from "react";
import { useIsMobile } from "../../../Hooks";
import { gsap } from "gsap";

export const TopBar: React.FC = () => {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFullHeight, setShowFullHeight] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isMobile || !navbarRef.current) return;

    const navbar = navbarRef.current;
    const overlay = menuOverlayRef.current;

    if (menuOpen) {
      // Set full height immediately when opening
      setShowFullHeight(true);

      // Animation when opening menu
      const tl = gsap.timeline();

      // Set initial state for overlay
      gsap.set(overlay, {
        display: "block",
        scaleX: 0,
        backgroundColor: "white", // Start from white
      });

      tl.to(overlay, {
        scaleX: 1,
        backgroundColor: "black",
        duration: 0.6,
        ease: "power2.out",
      }).to(
        navbar,
        {
          backgroundColor: "#000000",
          color: "#ffffff",
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.3"
      );
    } else {
      // Animation when closing menu - height changes AFTER animation
      const tl = gsap.timeline({
        onComplete: () => {
          // Remove full height only after animation completes
          setShowFullHeight(false);
        },
      });

      tl.to(navbar, {
        backgroundColor: "transparent",
        color: "#000000",
        duration: 0.3,
        ease: "power2.out",
      })
        .to(
          overlay,
          {
            scaleX: 0,
            duration: 0.4,
            ease: "power2.out",
            transformOrigin: "right center",
          },
          "-=0.1"
        )
        .set(overlay, {
          display: "none",
        });
    }
  }, [menuOpen, isMobile]);

  return (
    <div className={`relative ${showFullHeight && isMobile ? "h-screen" : ""}`}>
      {/* Menu Overlay - only visible on mobile */}
      {isMobile && (
        <div
          ref={menuOverlayRef}
          className="fixed inset-0 bg-black z-40 hidden"
          style={{ transformOrigin: "left center" }}
        />
      )}

      <div className={`relative z-50`} ref={mainContainerRef}>
        {/* Top Bar */}
        <div className="flex w-full">
          <div
            className="w-screen flex justify-between items-center p-4 z-50 relative transition-colors duration-300 fixed top-0 left-0"
            id="navbar"
            ref={navbarRef}
          >
            {/* Left */}
            <span
              className="flex items-center justify-start w-1/3 text-sm"
              id="collab-text"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="w-5 h-5 mr-2"
              >
                <path d="M12 2L2 7l10 5 10-5L12 2z" />
                <path d="M2 17l10 5 10-5V7L12 12 2 7v10z" />
              </svg>
              Open for any <br /> collaboration {!isMobile && "and offers"}
            </span>

            {/* Center and Right */}
            {!isMobile ? (
              <>
                <span
                  className="raaz-brand flex items-center justify-center relative w-1/3 text-center sm:text-xl md:text-2xl lg:text-4xl font-bold cursor-pointer"
                  data-text="00 Home"
                >
                  Raaz &copy;
                </span>
                <span className="flex justify-end relative w-1/3 text-center text-sm">
                  Folio v.5
                </span>
              </>
            ) : (
              <span className="flex items-center justify-end w-1/3 gap-4 text-right">
                <span
                  className={`raaz-brand relative sm:text-xl md:text-2xl lg:text-4xl font-bold`}
                >
                  Raaz &copy;
                </span>

                {/* Hamburger Icon */}
                <div
                  className="relative w-6 h-6 flex flex-col justify-center items-center cursor-pointer z-50"
                  onClick={toggleMenu}
                >
                  <div
                    className={`w-6 h-0.5 transition-all duration-300 ease-in-out ${
                      menuOpen
                        ? "rotate-45 translate-y-1.5 bg-white"
                        : "bg-black"
                    }`}
                  />
                  <div
                    className={`w-6 h-0.5 mt-1 transition-all duration-300 ease-in-out ${
                      menuOpen
                        ? "-rotate-45 -translate-y-1.5 bg-white"
                        : "bg-black"
                    }`}
                  />
                </div>
              </span>
            )}
          </div>
        </div>

        {/* Menu Content - only show when menu is open on mobile */}
        {menuOpen && isMobile && (
          <div className="fixed inset-0 pt-20 px-4 z-40">
            <div className="text-white text-2xl space-y-6">
              <div className="hover:text-gray-300 cursor-pointer transition-colors">
                Home
              </div>
              <div className="hover:text-gray-300 cursor-pointer transition-colors">
                About
              </div>
              <div className="hover:text-gray-300 cursor-pointer transition-colors">
                Work
              </div>
              <div className="hover:text-gray-300 cursor-pointer transition-colors">
                Contact
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
