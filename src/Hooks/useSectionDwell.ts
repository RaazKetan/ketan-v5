import { useEffect } from "react";
import { trackSection } from "../lib/analytics";

/* Lightweight section-visibility tracker. Pass the same selector you
   used on the section (or a ref that the section is on) and it fires:
   - section(enter, name) when ≥40% of the section is in view
   - section(exit,  name, ms_visible) when it leaves
   Multiple sections can be tracked in parallel; no global state. */

export function useSectionDwell(
  /* CSS selectors to observe. Each match becomes a tracked section using
     its [data-section] attribute as the name (or the selector itself
     as a fallback). */
  selectors: string[] | string,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const list = Array.isArray(selectors) ? selectors : [selectors];

    const matches = list.flatMap((s) =>
      Array.from(document.querySelectorAll<HTMLElement>(s))
    );
    if (matches.length === 0) return;

    const enteredAt = new WeakMap<HTMLElement, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const name =
            el.dataset.section ||
            el.id ||
            el.className.split(/\s+/)[0] ||
            "section";
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            if (!enteredAt.has(el)) {
              enteredAt.set(el, performance.now());
              trackSection(name, "enter");
            }
          } else if (enteredAt.has(el)) {
            const start = enteredAt.get(el)!;
            const ms = Math.round(performance.now() - start);
            enteredAt.delete(el);
            if (ms >= 800) trackSection(name, "exit", ms);
          }
        }
      },
      { threshold: [0, 0.4, 1] }
    );

    matches.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selectors, enabled]);
}
