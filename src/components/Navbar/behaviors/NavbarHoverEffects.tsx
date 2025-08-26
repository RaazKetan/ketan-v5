import React, { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

type NavItemData = { number?: string; label: string };

export interface NavbarHoverEffectsProps {
  collapsableDivRef: RefObject<HTMLDivElement | null>;
  backgroundDivRef: RefObject<HTMLDivElement | null>;
  /** Provide the item data by index; used to show number + label in the overlay */
  getNavItemData: (index: number) => NavItemData | null | undefined;
}

/**
 * NavbarHoverEffects
 *
 * Attaches hover behavior to navbar items:
 * - On hover: paints a black band that expands from the center (background-size),
 *   and shows centered overlay text (number + label) inside it.
 * - On leave: collapses the band and clears overlay styles/content.
 *
 * It does not render any UI; it only sets up listeners on existing DOM:
 * - Targets: `#main-navbar span.cursor-pointer, #navbar .raaz-brand`
 * - Requires: `collapsableDivRef` (band container) and `backgroundDivRef` (overlay text container)
 *
 * Usage:
 * <NavbarHoverEffects
 *   collapsableDivRef={collapsableDivRef}
 *   backgroundDivRef={backgroundDivRef}
 *   getNavItemData={(i) => MainNavbarData.navItems[i]}
 * />
 */
export const NavbarHoverEffects: React.FC<NavbarHoverEffectsProps> = ({
  collapsableDivRef,
  backgroundDivRef,
  getNavItemData,
}) => {
  type HoverElement = HTMLElement & {
    __onEnter?: (this: Element, ev: Event) => void;
    __onLeave?: (this: Element, ev: Event) => void;
  };
  useEffect(() => {
    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer, #navbar .raaz-brand"
    );

    navItems.forEach((item) => {
      const onEnter = () => {
        if (!collapsableDivRef.current || !backgroundDivRef.current) return;

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
          const data = getNavItemData(itemIndex);
          if (data) {
            numberHTML = data.number
              ? `<span style="font-weight: 700; color: #fbbf24;">${data.number}</span><br/>`
              : "";
            labelHTML = `<span>${data.label}</span>`;
          }
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
      };

      const onLeave = () => {
        if (!collapsableDivRef.current || !backgroundDivRef.current) return;

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
      };

      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);

      // Store on the element for cleanup
      (item as HoverElement).__onEnter = onEnter;
      (item as HoverElement).__onLeave = onLeave;
    });

    return () => {
      navItems.forEach((item) => {
        const onEnter = (item as HoverElement).__onEnter;
        const onLeave = (item as HoverElement).__onLeave;
        if (onEnter) item.removeEventListener("mouseenter", onEnter);
        if (onLeave) item.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [collapsableDivRef, backgroundDivRef, getNavItemData]);

  return null;
};


