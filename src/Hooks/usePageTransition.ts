import { useCallback } from "react";
import gsap from "gsap";

export function usePageTransition() {
  const navigateWithCenterFill = useCallback(async (navigate: (path: string) => void, path: string) => {
    const overlay = document.getElementById("page-transition-overlay");
    if (!overlay) {
      navigate(path);
      return;
    }

    // Center-fill: scale from middle vertically to cover, then navigate
    gsap.set(overlay, { opacity: 1, scaleY: 0, yPercent: 0, transformOrigin: "50% 50%" });
    await gsap.to(overlay, { scaleY: 1, duration: 1, ease: "power3.inOut" });

    sessionStorage.setItem("pageTransition", "1");
    navigate(path);
  }, []);

  const runExitRevealIfNeeded = useCallback(() => {
    const shouldAnimate = sessionStorage.getItem("pageTransition") === "1";
    if (!shouldAnimate) return;
    const overlay = document.getElementById("page-transition-overlay");
    if (!overlay) return;

    // Slide up to reveal content, then reset overlay
    gsap.to(overlay, {
      yPercent: -100,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        overlay.setAttribute("style", "opacity:0;pointer-events:none;position:fixed;left:0;top:0;width:100vw;height:100vh;background:#000;z-index:9999;transform:scaleY(0);transform-origin:50% 50%;");
        sessionStorage.removeItem("pageTransition");
      },
    });
  }, []);

  return { navigateWithCenterFill, runExitRevealIfNeeded };
}


