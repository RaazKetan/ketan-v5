import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Wires the global scroll/cursor behaviors from the design system:
   - Progress bar width tied to scroll
   - data-magnet hover translate
   - data-parallax / data-clip-reveal / data-image-in / data-spin
   Re-runs ScrollTrigger.refresh after layout settles. */
export function useDesignAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".progress", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || "-60");
        gsap.fromTo(
          el,
          { y: -amt / 2 },
          {
            y: amt / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      document.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });

      document
        .querySelectorAll<HTMLElement>("[data-image-in] img, [data-image-in] .img-fill")
        .forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 1.1 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "top 30%", scrub: 1 },
            }
          );
        });

      document.querySelectorAll<HTMLElement>("[data-spin]").forEach((el) => {
        const deg = parseFloat(el.dataset.spin || "180");
        gsap.to(el, {
          rotation: deg,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });

    // Magnetic hover effect (no GSAP context cleanup needed; we remove listeners manually).
    const magnetCleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
      const k = parseFloat(el.dataset.magnet || "") || 0.35;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * k, y: y * k, duration: 0.5, ease: "power3.out" });
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      magnetCleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    // refresh shortly after mount so heights settle (fonts, images)
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      ctx.revert();
      magnetCleanups.forEach((f) => f());
      window.clearTimeout(refreshId);
    };
  }, []);
}
