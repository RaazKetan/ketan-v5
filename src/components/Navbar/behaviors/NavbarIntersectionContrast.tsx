import React, { useEffect } from "react";
import gsap from "gsap";

/**
 * NavbarIntersectionContrast
 *
 * Watches elements with `data-nav-contrast="light|dark"` and switches
 * the navbar text color accordingly as those elements come under the navbar.
 *
 * Targets:
 * - TopBar wrapper: `#navbar`
 * - Main navbar items: `#main-component-of-navbar span`
 *
 * Usage:
 * <NavbarIntersectionContrast />
 * ...and mark sections:
 * <section data-nav-contrast="light" />
 * <section data-nav-contrast="dark" />
 */
export const NavbarIntersectionContrast: React.FC = () => {
  useEffect(() => {
    const navbarElement = document.getElementById("navbar");
    const mainComponent = document.getElementById("main-component-of-navbar");
    if (!navbarElement) return;

    const setColors = (mode: "light" | "dark") => {
      const targetColor = mode === "dark" ? "#ffffff" : "#000000";
      gsap.to(navbarElement, { color: targetColor, duration: 0.3, ease: "power2.out" });
      if (mainComponent) {
        const labels = mainComponent.querySelectorAll("#main-component-of-navbar span");
        gsap.to(labels, { color: targetColor, duration: 0.3, ease: "power2.out" });
      }
    };

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-contrast]"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (!visible) return;
        const value = (visible.target as HTMLElement).dataset.navContrast as "light" | "dark" | undefined;
        if (value === "dark" || value === "light") setColors(value);
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return null;
};


